import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json({ error: "Account is suspended. Please contact admin." }, { status: 403 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionUser = await createSession(user.id);

    // Audit log
    await db.activityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "USER_LOGIN",
        entity: "User",
        entityId: user.id,
        details: `Successful sign-in as ${user.role.name}`,
      },
    });

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}
