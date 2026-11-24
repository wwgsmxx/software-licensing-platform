import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing Platform Roles and System Permissions...");

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: {
      code: "ADMIN",
      name: "System Administrator",
      description: "Full administrative operations, user management, and system settings",
    },
  });

  const reviewerRole = await prisma.role.upsert({
    where: { code: "REVIEWER" },
    update: {},
    create: {
      code: "REVIEWER",
      name: "License Reviewer",
      description: "Audits software applications, reviews uploaded documents, and approves/rejects submissions",
    },
  });

  const licenseManagerRole = await prisma.role.upsert({
    where: { code: "LICENSE_MANAGER" },
    update: {},
    create: {
      code: "LICENSE_MANAGER",
      name: "License Manager",
      description: "Manages digital license lifecycle, certificate issuance, suspension, and revocation",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: "USER" },
    update: {},
    create: {
      code: "USER",
      name: "Standard Applicant User",
      description: "Registers software products, creates licensing applications, and signs digitally",
    },
  });

  // 2. Permissions
  const permissions = [
    { code: "application:create", description: "Create license applications" },
    { code: "application:read_own", description: "Read own license applications" },
    { code: "application:read_all", description: "Read all platform applications" },
    { code: "application:sign", description: "Sign application digitally" },
    { code: "application:submit", description: "Submit application for review" },
    { code: "application:review", description: "Review pending applications" },
    { code: "application:approve_reject", description: "Approve or reject applications" },
    { code: "license:view", description: "View license certificates" },
    { code: "license:issue", description: "Issue digital license certificates" },
    { code: "license:revoke_suspend", description: "Suspend or revoke active licenses" },
    { code: "user:manage", description: "Manage platform users and permissions" },
    { code: "system:configure", description: "Configure system parameters and settings" },
    { code: "audit:read", description: "View immutable system audit logs" },
  ];

  for (const p of permissions) {
    const permRecord = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });

    // Assign permissions to Admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permRecord.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permRecord.id,
      },
    });

    // Assign user permissions
    if (["application:create", "application:read_own", "application:sign", "application:submit", "license:view"].includes(p.code)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permRecord.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permRecord.id,
        },
      });
    }
  }

  // 3. Standard Demo & Testing Accounts (password: password123)
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const demoUsers = [
    {
      email: "admin@example.com",
      name: "Алексей Волков (Системный Администратор)",
      passwordHash: defaultPasswordHash,
      phone: "+7 701 111 2233",
      iin: "850101300111",
      roleId: adminRole.id,
    },
    {
      email: "reviewer@example.com",
      name: "Елена Сидорова (Эксперт лицензирования)",
      passwordHash: defaultPasswordHash,
      phone: "+7 702 222 3344",
      iin: "900202400222",
      roleId: reviewerRole.id,
    },
    {
      email: "manager@example.com",
      name: "Арман Нурпеисов (Менеджер лицензий)",
      passwordHash: defaultPasswordHash,
      phone: "+7 705 333 4455",
      iin: "880303300333",
      roleId: licenseManagerRole.id,
    },
    {
      email: "user@example.com",
      name: "Дамир Жаксылыков (Разработчик ПО)",
      passwordHash: defaultPasswordHash,
      phone: "+7 777 444 5566",
      iin: "950404300444",
      roleId: userRole.id,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: u.passwordHash,
        name: u.name,
        roleId: u.roleId,
      },
      create: u,
    });
  }

  console.log("✅ Platform roles, permissions, and test accounts initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
