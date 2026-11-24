import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ success: true });
  res.cookies.set("flexora_session", "", { maxAge: 0, path: "/", expires: new Date(0) });
  res.cookies.set("licensing_session", "", { maxAge: 0, path: "/", expires: new Date(0) });
  return res;
}

export async function GET(req: Request) {
  await destroySession();
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set("flexora_session", "", { maxAge: 0, path: "/", expires: new Date(0) });
  res.cookies.set("licensing_session", "", { maxAge: 0, path: "/", expires: new Date(0) });
  return res;
}
