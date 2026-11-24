import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Count unread notifications
  const unreadCount = await db.notification.count({
    where: { userId: session.id, read: false },
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar roleCode={session.roleCode} unreadCount={unreadCount} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
