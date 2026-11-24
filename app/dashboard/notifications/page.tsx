import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserNotificationsClientView } from "@/components/dashboard/UserNotificationsClientView";

export default async function UserNotificationsPage() {
  const session = await getSession();
  if (!session) return null;

  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <UserNotificationsClientView
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  );
}
