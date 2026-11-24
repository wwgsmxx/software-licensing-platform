import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name field cannot be empty" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: session.id,
        details: "Updated user profile details",
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json(
      { error: "Failed to update profile details" },
      { status: 500 }
    );
  }
}
