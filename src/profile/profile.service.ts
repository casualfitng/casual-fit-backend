import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { estimateTargets } from "../lib/targets";
import { DbService } from "../db/db.service";
import { profiles } from "../db/schema";
import { PlanService } from "../plan/plan.service";
import type { SaveProfileDto } from "./dto";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 2 * 1024 * 1024;

type ProfileRow = typeof profiles.$inferSelect;

export type ClientProfile = Omit<ProfileRow, "avatarData"> & {
  avatarImageBase64: string | null;
};

@Injectable()
export class ProfileService {
  constructor(
    private readonly dbService: DbService,
    private readonly plans: PlanService,
  ) {}

  async get(userId: string): Promise<ClientProfile> {
    const profile = await this.find(userId);
    if (!profile) throw new NotFoundException("Profile not found.");
    return this.toClientProfile(profile);
  }

  async save(userId: string, input: SaveProfileDto): Promise<ClientProfile> {
    if (input.location !== "gym" && input.equipment.length === 0) {
      throw new BadRequestException("Choose the equipment you have at home.");
    }

    const targets = estimateTargets({
      gender: input.gender,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      activityLevel: input.activityLevel,
      goals: input.goals,
    });

    const [profile] = await this.dbService.db
      .update(profiles)
      .set({
        name: input.name.trim(),
        age: input.age,
        gender: input.gender,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        goalWeightKg: input.goalWeightKg,
        goals: input.goals,
        experience: input.experience,
        location: input.location,
        equipment: input.location === "gym" ? [] : input.equipment,
        trainingDays: input.trainingDays,
        activityLevel: input.activityLevel,
        cuisines: input.cuisines,
        restrictions: input.restrictions,
        calorieTarget: targets.calorieTarget,
        proteinTargetG: targets.proteinTargetG,
        onboardingComplete: true,
      })
      .where(eq(profiles.userId, userId))
      .returning();

    if (!profile) throw new NotFoundException("Profile not found.");
    await this.plans.assignIfMissing(userId);
    return this.toClientProfile(profile);
  }

  async saveUploadedAvatar(userId: string, file: Express.Multer.File): Promise<ClientProfile> {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException("Use a JPG, PNG, or WebP photo.");
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException("Photo must be 2 MB or smaller.");
    }

    const avatarData = file.buffer.toString("base64");

    const [profile] = await this.dbService.db
      .update(profiles)
      .set({
        avatarData,
        avatarMimeType: file.mimetype === "image/heic" || file.mimetype === "image/heif" ? "image/jpeg" : file.mimetype,
      })
      .where(eq(profiles.userId, userId))
      .returning();

    if (!profile) throw new NotFoundException("Profile not found.");
    return this.toClientProfile(profile);
  }

  async clearAvatar(userId: string): Promise<ClientProfile> {
    const [profile] = await this.dbService.db
      .update(profiles)
      .set({ avatarData: null, avatarMimeType: null })
      .where(eq(profiles.userId, userId))
      .returning();
    if (!profile) throw new NotFoundException("Profile not found.");
    return this.toClientProfile(profile);
  }

  private toClientProfile(row: ProfileRow): ClientProfile {
    const { avatarData, ...rest } = row;
    return {
      ...rest,
      avatarImageBase64: avatarData ?? null,
    };
  }

  private async find(userId: string) {
    const [profile] = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return profile;
  }
}
