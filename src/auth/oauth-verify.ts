import { createRemoteJWKSet, jwtVerify } from "jose";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type OAuthProfile = {
  sub: string;
  email: string;
  picture?: string;
};

export async function verifyGoogleIdToken(idToken: string, clientIds: string[]): Promise<OAuthProfile> {
  if (clientIds.length === 0) {
    throw new Error("Google sign-in is not configured on the server.");
  }
  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientIds,
  });
  if (!payload.sub) throw new Error("Google token is missing a subject.");
  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!email) throw new Error("Google did not share an email address.");
  const picture = typeof payload.picture === "string" ? payload.picture : undefined;
  return { sub: payload.sub, email: email.toLowerCase(), picture };
}

export async function verifyAppleIdToken(idToken: string, bundleId: string): Promise<OAuthProfile> {
  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: bundleId,
  });
  if (!payload.sub) throw new Error("Apple token is missing a subject.");
  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!email) throw new Error("Apple did not share an email address.");
  return { sub: payload.sub, email: email.toLowerCase() };
}
