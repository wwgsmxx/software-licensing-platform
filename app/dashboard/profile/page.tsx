import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserProfileClientView } from "@/components/dashboard/UserProfileClientView";

export default async function UserProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.id },
    include: { role: true },
  });

  if (!user) return null;

  return (
    <UserProfileClientView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleName: user.role.name,
        roleCode: user.role.code,
      }}
    />
  );
}
