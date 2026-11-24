import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EcpManagementClientView } from "@/components/dashboard/EcpManagementClientView";

export default async function EcpManagementPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [user, certificates, organizationMemberships, activityLogs] =
    await Promise.all([
      db.user.findUnique({
        where: { id: session.id },
        select: { id: true, name: true, email: true, iin: true },
      }),
      db.certificate.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      }),
      db.organizationMember.findMany({
        where: { userId: session.id },
        include: { organization: true },
      }),
      db.activityLog.findMany({
        where: {
          userId: session.id,
          action: {
            in: [
              "ECP_LOGIN",
              "ECP_REGISTRATION",
              "CERTIFICATE_BOUND",
              "APPLICATION_SIGNED",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return (
    <EcpManagementClientView
      currentUser={{
        id: session.id,
        name: user?.name || session.name,
        email: user?.email || session.email,
        roleCode: session.roleCode,
        iin: user?.iin,
      }}
      certificates={certificates}
      organizationMemberships={organizationMemberships}
      activityLogs={activityLogs}
    />
  );
}
