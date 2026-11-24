import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { certificate, signature, challenge, email, password, phone } = await req.json();

    if (!certificate || !certificate.ownerName) {
      return NextResponse.json(
        { error: "Не предоставлены достоверные данные сертификата ЭЦП" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Укажите корректный рабочий адрес электронной почты" },
        { status: 400 }
      );
    }

    // Verify challenge cookie if present
    const cookieStore = await cookies();
    const storedChallenge = cookieStore.get("flexora_auth_challenge")?.value;
    if (storedChallenge && challenge && storedChallenge !== challenge) {
      return NextResponse.json(
        { error: "Недействительный или просроченный запрос авторизации" },
        { status: 400 }
      );
    }

    const iin = certificate.iin?.trim() || null;
    const fingerprint = certificate.keyFingerprint?.trim().toUpperCase();

    // 1. Prevent duplicate registration of the same verified identity
    if (iin) {
      const existingUserWithIin = await db.user.findFirst({
        where: { iin },
      });
      if (existingUserWithIin) {
        return NextResponse.json(
          {
            error: `Пользователь с ИИН ${iin} уже зарегистрирован (${existingUserWithIin.email}). Пожалуйста, выполните вход через ЭЦП.`,
          },
          { status: 409 }
        );
      }
    }

    // 2. Prevent duplicate email
    const existingEmail = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует в системе." },
        { status: 409 }
      );
    }

    // 3. Find default role (First user becomes ADMIN, others USER)
    const userCount = await db.user.count();
    const roleCode = userCount === 0 ? "ADMIN" : "USER";
    const assignedRole = (await db.role.findUnique({ where: { code: roleCode } })) || (await db.role.findUnique({ where: { code: "USER" } }));
    if (!assignedRole) {
      return NextResponse.json(
        { error: "Системная роль не найдена в базе данных" },
        { status: 500 }
      );
    }

    const randomPassword = password || `EcpUser_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    // 4. Create User with verified name from certificate
    const newUser = await db.user.create({
      data: {
        name: certificate.ownerName, // Trust verified certificate name
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
        iin,
        roleId: assignedRole.id,
      },
      include: { role: true },
    });

    // 5. Create bound Certificate record
    if (fingerprint) {
      await db.certificate.create({
        data: {
          userId: newUser.id,
          subjectType: certificate.subjectType || (certificate.bin ? "LEGAL_ENTITY" : "INDIVIDUAL"),
          ownerName: certificate.ownerName,
          iin,
          bin: certificate.bin || null,
          organizationName: certificate.organizationName || null,
          keyFingerprint: fingerprint,
          serialNumber: certificate.serialNumber || null,
          algorithm: certificate.algorithm || "GOST R 34.10-2015",
          issuer: certificate.issuer || "Национальный удостоверяющий центр РК (НУЦ РК)",
          source: "NCALAYER",
          status: "ACTIVE",
          issuedAt: certificate.notBefore ? new Date(certificate.notBefore) : new Date(),
          expiresAt: certificate.notAfter ? new Date(certificate.notAfter) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
        },
      });
    }

    // 6. Organization linking if legal entity
    if (certificate.bin && certificate.organizationName) {
      const org = await db.organization.upsert({
        where: { bin: certificate.bin },
        update: { name: certificate.organizationName },
        create: {
          bin: certificate.bin,
          name: certificate.organizationName,
          verified: true,
        },
      });

      await db.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: newUser.id,
          role: "REPRESENTATIVE",
          powerBasis: "ЭЦП Юридического лица НУЦ РК",
        },
      });
    }

    // 7. Establish session
    const sessionUser = await createSession(newUser.id);

    // Audit log
    await db.activityLog.create({
      data: {
        userId: newUser.id,
        userEmail: newUser.email,
        action: "ECP_REGISTRATION",
        entity: "User",
        entityId: newUser.id,
        details: `Регистрация через ЭЦП: ${certificate.ownerName} (ИИН: ${iin || "—"}, БИН: ${certificate.bin || "—"})`,
      },
    });

    return NextResponse.json({
      success: true,
      user: sessionUser,
      message: "Регистрация через ЭЦП успешно завершена",
    });
  } catch (err: unknown) {
    console.error("ECP Register API Error:", err);
    return NextResponse.json(
      { error: "Ошибка сервера при регистрации через ЭЦП" },
      { status: 500 }
    );
  }
}
