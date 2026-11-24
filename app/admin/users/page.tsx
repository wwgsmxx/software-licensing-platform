import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminUsersClientView, UserRow } from "@/components/admin/AdminUsersClientView";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) return null;

  const users = await db.user.findMany({
    include: { role: true, _count: { select: { applications: true, licenses: true } } },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.name,
    roleCode: u.role.code,
    phone: u.phone || "N/A",
    isSuspended: u.isSuspended,
    applicationsCount: u._count.applications,
    licensesCount: u._count.licenses,
    createdAt: new Date(u.createdAt).toLocaleDateString(),
  }));

  return <AdminUsersClientView users={formattedData} />;
}
