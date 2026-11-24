import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSession, getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { signature, certificate, challenge } = await req.json();

    if (!certificate || !certificate.ownerName) {
      return NextResponse.json(
        { error: "Не предоставлены достоверные данные сертификата ЭЦП" },
        { status: 400 }
      );
    }

    // Verify challenge cookie
    const cookieStore = await cookies();
    const storedChallenge = cookieStore.get("flexora_auth_challenge")?.value;
    if (storedChallenge && challenge && storedChallenge !== challenge) {
      return NextResponse.json(
        { error: "Недействительный или просроченный криптографический запрос (nonce)" },
        { status: 400 }
      );
    }

    const iin = certificate.iin?.trim() || null;
    const fingerprint = certificate.keyFingerprint?.trim().toUpperCase();

    // ── Check if user is ALREADY authenticated (Binding mode) ──
    const currentSession = await getSession();

    if (currentSession && currentSession.id) {
      const loggedInUser = await db.user.findUnique({
        where: { id: currentSession.id },
        include: { role: true },
      });

      if (loggedInUser) {
        // Update user IIN if not yet set or matching
        if (iin && !loggedInUser.iin) {
          await db.user.update({
            where: { id: loggedInUser.id },
            data: { iin },
          });
        }

        // Upsert certificate binding to loggedInUser
        if (fingerprint) {
          await db.certificate.upsert({
            where: { keyFingerprint: fingerprint },
            update: {
              userId: loggedInUser.id,
              status: "ACTIVE",
              updatedAt: new Date(),
              ownerName: certificate.ownerName,
              iin: iin || undefined,
              bin: certificate.bin || undefined,
              organizationName: certificate.organizationName || undefined,
              algorithm: certificate.algorithm || "GOST R 34.10-2015",
              issuer: certificate.issuer || "НУЦ РК",
            },
            create: {
              userId: loggedInUser.id,
              subjectType: certificate.subjectType || (certificate.bin ? "LEGAL_ENTITY" : "INDIVIDUAL"),
              ownerName: certificate.ownerName,
              iin: iin || null,
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

        // Handle legal entity organization linkage if BIN is present
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

          await db.organizationMember.upsert({
            where: {
              organizationId_userId: {
                organizationId: org.id,
                userId: loggedInUser.id,
              },
            },
            update: { role: "REPRESENTATIVE" },
            create: {
              organizationId: org.id,
              userId: loggedInUser.id,
              role: "REPRESENTATIVE",
              powerBasis: "ЭЦП Юридического лица НУЦ РК",
            },
          });
        }

        // Audit log for binding
        await db.activityLog.create({
          data: {
            userId: loggedInUser.id,
            userEmail: loggedInUser.email,
            action: "ECP_BOUND",
            entity: "Certificate",
            entityId: fingerprint || loggedInUser.id,
            details: `Привязка ЭЦП: ${certificate.ownerName} (${iin || certificate.bin || "Без ИИН"})`,
          },
        });

        return NextResponse.json({
          success: true,
          bound: true,
          message: "Сертификат ЭЦП успешно привязан к вашей учётной записи.",
          user: loggedInUser,
        });
      }
    }

    // ── Login Mode (User is NOT logged in) ──
    let user = null;

    // 1. Locate user by Certificate fingerprint first (exact binding)
    if (fingerprint) {
      const boundCert = await db.certificate.findUnique({
        where: { keyFingerprint: fingerprint },
        include: { user: { include: { role: true } } },
      });
      if (boundCert && boundCert.user) {
        user = boundCert.user;
      }
    }

    // 2. Locate user by IIN if not found by fingerprint
    if (!user && iin) {
      user = await db.user.findFirst({
        where: { iin },
        include: { role: true },
      });
    }

    // If still no user found -> this EDS is NOT linked to any account
    if (!user) {
      return NextResponse.json(
        {
          notBound: true,
          error: "Данная ЭЦП ещё не привязана к аккаунту. Пожалуйста, войдите по логину и паролю и привяжите ЭЦП в разделе «Управление ЭЦП», либо зарегистрируйтесь с этой ЭЦП.",
          certificateOwner: certificate.ownerName,
          iin: certificate.iin,
          bin: certificate.bin,
          organization: certificate.organizationName,
        },
        { status: 404 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Учётная запись заблокирована администратором." },
        { status: 403 }
      );
    }

    // Ensure certificate binding record is active
    if (fingerprint) {
      await db.certificate.upsert({
        where: { keyFingerprint: fingerprint },
        update: {
          status: "ACTIVE",
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          subjectType: certificate.subjectType || (certificate.bin ? "LEGAL_ENTITY" : "INDIVIDUAL"),
          ownerName: certificate.ownerName,
          iin: certificate.iin || null,
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

    // Handle legal entity organization linkage if BIN is present
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

      await db.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id,
          },
        },
        update: { role: "REPRESENTATIVE" },
        create: {
          organizationId: org.id,
          userId: user.id,
          role: "REPRESENTATIVE",
          powerBasis: "ЭЦП Юридического лица НУЦ РК",
        },
      });
    }

    const sessionUser = await createSession(user.id);

    // Audit log
    await db.activityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "ECP_LOGIN",
        entity: "Certificate",
        entityId: fingerprint || user.id,
        details: `Вход с использованием ЭЦП: ${certificate.ownerName} (${certificate.iin || certificate.bin || "Без ИИН"})`,
      },
    });

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (err: unknown) {
    console.error("ECP Login API Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера при обработке ЭЦП" },
      { status: 500 }
    );
  }
}
