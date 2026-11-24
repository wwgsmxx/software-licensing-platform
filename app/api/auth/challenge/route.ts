import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const nonce = `FLEXORA-AUTH-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`;
  
  const res = NextResponse.json({
    challenge: nonce,
    timestamp: new Date().toISOString(),
  });

  // Store in short-lived cookie for verification
  res.cookies.set("flexora_auth_challenge", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return res;
}
