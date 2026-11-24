import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { DEFAULT_ROLE_PERMISSIONS, hasPermission, PermissionCode } from "@/lib/permissions";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleCode: string;
  roleName: string;
  permissions: string[];
}

const SESSION_COOKIE_NAME = "flexora_session";
const LEGACY_SESSION_COOKIE_NAME = "licensing_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "flexora-crypt-secure-session-key-2026-sha256";

/**
 * Sign payload using HMAC-SHA256 to prevent cookie tampering / forgery
 */
function signCookiePayload(payloadStr: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payloadStr).digest("hex");
  const base64Payload = Buffer.from(payloadStr, "utf-8").toString("base64url");
  return `${base64Payload}.${hmac}`;
}

/**
 * Verify HMAC signature and decode payload
 */
function verifyAndDecodeCookiePayload(cookieVal: string): string | null {
  if (!cookieVal) return null;

  // Backward compatibility with raw JSON during session transition
  if (cookieVal.startsWith("{") && cookieVal.endsWith("}")) {
    return cookieVal;
  }

  const parts = cookieVal.split(".");
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  try {
    const payloadStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payloadStr).digest("hex");
    
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedHmac, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    return payloadStr;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.isSuspended) return null;

  const permissions = DEFAULT_ROLE_PERMISSIONS[user.role.code] || [];

  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    roleCode: user.role.code,
    roleName: user.role.name,
    permissions,
  };

  const rawJson = JSON.stringify(sessionData);
  const signedValue = signCookiePayload(rawJson);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return sessionData;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    let sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      // Check legacy cookie name
      sessionCookie = cookieStore.get(LEGACY_SESSION_COOKIE_NAME);
    }
    if (!sessionCookie?.value) return null;

    const payloadJson = verifyAndDecodeCookiePayload(sessionCookie.value);
    if (!payloadJson) return null;

    const sessionUser = JSON.parse(payloadJson) as SessionUser;

    // Verify user exists and isn't suspended from server database
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: { role: true },
    });

    if (!user || user.isSuspended) return null;

    return {
      ...sessionUser,
      roleCode: user.role.code,
      roleName: user.role.name,
      permissions: DEFAULT_ROLE_PERMISSIONS[user.role.code] || [],
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/", expires: new Date(0) });
  cookieStore.set(LEGACY_SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/", expires: new Date(0) });
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requirePermission(permission: PermissionCode): Promise<SessionUser> {
  const session = await requireAuth();
  if (!hasPermission(session.roleCode, session.permissions, permission)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
