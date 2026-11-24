import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email address already exists" }, { status: 400 });
    }

    // First user becomes ADMIN, subsequent users are USER
    const userCount = await db.user.count();
    const roleCode = userCount === 0 ? "ADMIN" : "USER";
    const assignedRole = (await db.role.findUnique({ where: { code: roleCode } })) || (await db.role.findUnique({ where: { code: "USER" } }));
    if (!assignedRole) {
      return NextResponse.json({ error: "System role configuration missing" }, { status: 500 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        roleId: assignedRole.id,
      },
    });

    const sessionUser = await createSession(newUser.id);

    await db.activityLog.create({
      data: {
        userId: newUser.id,
        userEmail: newUser.email,
        action: "USER_REGISTER",
        entity: "User",
        entityId: newUser.id,
        details: `Registered applicant account ${newUser.name}`,
      },
    });

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
