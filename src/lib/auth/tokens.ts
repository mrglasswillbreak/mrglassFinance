import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const ACCESS_COOKIE = "mf_access";
const REFRESH_COOKIE = "mf_refresh";
const ACCESS_TTL_SECONDS = 60 * 15;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

type AccessTokenPayload = {
  sub: string;
  tenantId: string;
  role: "OWNER" | "MEMBER";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }
  return new TextEncoder().encode(secret);
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateRefreshToken() {
  return randomBytes(48).toString("hex");
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as unknown as AccessTokenPayload;
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}

export const authCookieNames = { ACCESS_COOKIE, REFRESH_COOKIE };
