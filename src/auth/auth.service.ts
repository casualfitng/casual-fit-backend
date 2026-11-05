import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import * as argon2 from "argon2";
import { DbService } from "../db/db.service";
import {
  passwordResetTokens,
  profiles,
  refreshTokens,
  userIdentities,
  users,
} from "../db/schema";
import { verifyAppleIdToken, verifyGoogleIdToken, type OAuthProfile } from "./oauth-verify";

type PublicUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  onboardingComplete: boolean;
};

type Session = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

const REFRESH_DAYS = 30;
const RESET_MINUTES = 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(email: string, password: string): Promise<Session> {
    const passwordHash = await argon2.hash(password);
    try {
      const [user] = await this.dbService.db
        .insert(users)
        .values({ email, passwordHash })
        .returning();
      await this.dbService.db.insert(profiles).values({ userId: user.id });
      return this.issueSession({ ...user, onboardingComplete: false });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("An account with that email already exists.");
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<Session> {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException("Email or password is wrong.");
    if (!user.passwordHash) {
      throw new UnauthorizedException("Use Google or Apple to sign in to this account.");
    }
    const matches = await argon2.verify(user.passwordHash, password);
    if (!matches) throw new UnauthorizedException("Email or password is wrong.");
    const profile = await this.findProfile(user.id);
    return this.issueSession({
      ...user,
      onboardingComplete: profile?.onboardingComplete ?? false,
    });
  }

  async oauthSignIn(
    provider: "google" | "apple",
    idToken: string,
    avatarUrlFromClient?: string,
  ): Promise<Session> {
    let profile: OAuthProfile;
    try {
      profile =
        provider === "google"
          ? await verifyGoogleIdToken(idToken, this.googleClientIds())
          : await verifyAppleIdToken(idToken, this.appleBundleId());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid sign-in token.";
      throw new UnauthorizedException(message);
    }

    const oauthAvatar = avatarUrlFromClient ?? profile.picture;

    const existingIdentity = await this.findIdentity(provider, profile.sub);
    if (existingIdentity) {
      const user = await this.findUserById(existingIdentity.userId);
      if (!user) throw new UnauthorizedException("Sign in again.");
      await this.setAvatarIfEmpty(user.id, oauthAvatar);
      const userProfile = await this.findProfile(user.id);
      return this.issueSession({
        ...user,
        onboardingComplete: userProfile?.onboardingComplete ?? false,
      });
    }

    const userByEmail = await this.findUserByEmail(profile.email);
    if (userByEmail) {
      await this.linkIdentity(userByEmail.id, provider, profile.sub);
      await this.setAvatarIfEmpty(userByEmail.id, oauthAvatar);
      const userProfile = await this.findProfile(userByEmail.id);
      return this.issueSession({
        ...userByEmail,
        onboardingComplete: userProfile?.onboardingComplete ?? false,
      });
    }

    try {
      const [user] = await this.dbService.db
        .insert(users)
        .values({ email: profile.email })
        .returning();
      await this.dbService.db.insert(profiles).values({
        userId: user.id,
        avatarUrl: oauthAvatar ?? null,
      });
      await this.linkIdentity(user.id, provider, profile.sub);
      return this.issueSession({ ...user, onboardingComplete: false });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("An account with that email already exists.");
      }
      throw error;
    }
  }

  async refresh(rawToken: string): Promise<Session> {
    const row = await this.findRefreshToken(rawToken);
    if (!row) throw new UnauthorizedException("Sign in again.");
    await this.revokeRefreshToken(row.id);
    const user = await this.findUserById(row.userId);
    if (!user) throw new UnauthorizedException("Sign in again.");
    const profile = await this.findProfile(user.id);
    return this.issueSession({
      ...user,
      onboardingComplete: profile?.onboardingComplete ?? false,
    });
  }

  async logout(rawToken: string) {
    const row = await this.findRefreshToken(rawToken);
    if (row) await this.revokeRefreshToken(row.id);
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const user = await this.findUserByEmail(email);
    const message = "If that email has an account, a reset token is ready.";
    if (!user) return { message };

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
    await this.dbService.db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    if (process.env.NODE_ENV === "production") return { message };
    return { message, devResetToken: token };
  }

  async resetPassword(token: string, password: string) {
    const now = new Date();
    const [row] = await this.dbService.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashToken(token)),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);

    if (!row || row.expiresAt < now) {
      throw new UnauthorizedException("That reset token is invalid or expired.");
    }

    const passwordHash = await argon2.hash(password);
    await this.dbService.db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, row.userId));
    await this.dbService.db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, row.id));
    await this.dbService.db
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(and(eq(refreshTokens.userId, row.userId), isNull(refreshTokens.revokedAt)));

    return { ok: true };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.findUserById(userId);
    if (!user) throw new UnauthorizedException("Sign in again.");
    const profile = await this.findProfile(user.id);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingComplete: profile?.onboardingComplete ?? false,
    };
  }

  private async issueSession(
    user: PublicUser & { passwordHash?: string | null },
  ): Promise<Session> {
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
    };
    const accessToken = await this.jwt.signAsync(
      { sub: publicUser.id, email: publicUser.email, role: publicUser.role },
      {
        secret: this.config.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: "15m",
      },
    );
    const refreshToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await this.dbService.db.insert(refreshTokens).values({
      userId: publicUser.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });
    return { accessToken, refreshToken, user: publicUser };
  }

  private async findUserByEmail(email: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  private async findUserById(id: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  private async findProfile(userId: string) {
    const [profile] = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return profile;
  }

  private async setAvatarIfEmpty(userId: string, avatarUrl?: string) {
    if (!avatarUrl) return;
    await this.dbService.db
      .update(profiles)
      .set({ avatarUrl })
      .where(and(eq(profiles.userId, userId), isNull(profiles.avatarUrl)));
  }

  private googleClientIds() {
    const raw = this.config.get<string>("GOOGLE_CLIENT_IDS") ?? "";
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private appleBundleId() {
    return this.config.get<string>("APPLE_BUNDLE_ID") ?? "com.casualfit.app";
  }

  private async findIdentity(provider: "google" | "apple", providerUserId: string) {
    const [row] = await this.dbService.db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.provider, provider),
          eq(userIdentities.providerUserId, providerUserId),
        ),
      )
      .limit(1);
    return row;
  }

  private async linkIdentity(
    userId: string,
    provider: "google" | "apple",
    providerUserId: string,
  ) {
    try {
      await this.dbService.db.insert(userIdentities).values({
        userId,
        provider,
        providerUserId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) return;
      throw error;
    }
  }

  private async findRefreshToken(rawToken: string) {
    const now = new Date();
    const [row] = await this.dbService.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, hashToken(rawToken)),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .limit(1);
    if (!row || row.expiresAt < now) return null;
    return row;
  }

  private async revokeRefreshToken(id: string) {
    await this.dbService.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, id));
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isUniqueViolation(error: unknown) {
  const candidate = error as { code?: string; cause?: { code?: string } };
  return candidate.code === "23505" || candidate.cause?.code === "23505";
}
