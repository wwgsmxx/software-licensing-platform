import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.roleCode !== "ADMIN" && session.roleCode !== "REVIEWER")) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Reviewer role required" },
        { status: 403 }
      );
    }

    const { title, message, targetGroup = "ALL" } = await req.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    let userWhere: any = {};
    if (targetGroup === "USERS") {
      userWhere = { role: { code: "USER" } };
    } else if (targetGroup === "ADMINS") {
      userWhere = { role: { code: { in: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"] } } };
    }

    const targetUsers = await db.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await db.notification.createMany({
        data: targetUsers.map((u) => ({
          userId: u.id,
          type: "SYSTEM_BROADCAST",
          title,
          message,
          read: false,
        })),
      });
    }

    // Audit log
    await db.activityLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "BROADCAST_NOTIFICATION_DISPATCHED",
        entity: "Notification",
        details: `Dispatched broadcast '${title}' to ${targetUsers.length} users (${targetGroup})`,
      },
    });

    return NextResponse.json({
      success: true,
      recipientsCount: targetUsers.length,
    });
  } catch (error) {
    console.error("Broadcast notification API error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch broadcast notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: session.id, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await db.notification.update({
        where: { id: notificationId, userId: session.id },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notification API error:", error);
    return NextResponse.json(
      { error: "Failed to update notification status" },
      { status: 500 }
    );
  }
}
