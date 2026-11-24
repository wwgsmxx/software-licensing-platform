import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.roleCode !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin role required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { isSuspended, roleCode } = await req.json();

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (typeof isSuspended === "boolean") {
      updateData.isSuspended = isSuspended;
    }

    if (roleCode) {
      const role = await db.role.findUnique({ where: { code: roleCode } });
      if (role) {
        updateData.roleId = role.id;
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "ADMIN_UPDATE_USER",
        entity: "User",
        entityId: id,
        details: `Updated user ${updatedUser.email}: suspended=${updatedUser.isSuspended}, role=${updatedUser.role.code}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.name,
        roleCode: updatedUser.role.code,
        isSuspended: updatedUser.isSuspended,
      },
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Internal server error updating user" },
      { status: 500 }
    );
  }
}
