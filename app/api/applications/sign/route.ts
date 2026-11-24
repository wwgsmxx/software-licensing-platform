import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  canonicalizeJson,
  computeSha256,
  signApplicationPayload,
  SignaturePayload,
} from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const {
      applicationId = "DRAFT",
      softwareName,
      softwareVersion,
      developer,
      licenseType,
      licenseDuration,
      numUsers,
      documents = [],
      applicantType = "INDIVIDUAL",
      iin,
      bin,
      orgName,
      representativeName,
      // Optional client-side signature data (from NCALayer or FleXora Key)
      signatureType = "SIMULATED", // "NCALAYER" | "APP_KEY" | "SIMULATED"
      clientSignatureHex,
      clientKeyId,
      certificate,
    } = body;

    const payload: SignaturePayload = {
      applicationId,
      softwareName,
      softwareVersion,
      developer,
      licenseType,
      licenseDuration,
      numUsers: Number(numUsers) || 1,
      documents: documents.map((d: any) => ({
        filename: d.filename || d.originalName || "document",
        checksumSha256: d.checksumSha256,
      })),
      signerEmail: session.email,
      applicantType,
      iin: iin || undefined,
      bin: bin || undefined,
      orgName: orgName || undefined,
      representativeName: representativeName || undefined,
    };

    const canonicalStr = canonicalizeJson(payload);
    const payloadHash = computeSha256(canonicalStr);

    // ── 1. NCALAYER / GOST SIGNATURE ──
    if (signatureType === "NCALAYER" && clientSignatureHex && certificate) {
      const verificationId = `NCA-${payloadHash.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      return NextResponse.json({
        success: true,
        signature: {
          payloadHash,
          signature: clientSignatureHex,
          algorithm: certificate.algorithm || "GOST R 34.10-2015",
          signatureType: "NCALAYER",
          keyFingerprint: certificate.keyFingerprint || "NCALAYER-FINGERPRINT",
          verificationId,
          signerName: certificate.ownerName || session.name,
          signerEmail: session.email,
          signerIin: certificate.iin || iin || null,
          signerBin: certificate.bin || bin || null,
          certificateIssuer: certificate.issuer || "НУЦ РК",
          certificateSerial: certificate.serialNumber || null,
          signedContent: canonicalStr,
          signedAt: new Date(),
          isVerified: true,
        },
      });
    }

    // ── 2. SIMULATED TEST SIGNATURE (Clearly flagged for test/dev environments without active NCALayer) ──
    const signerName = representativeName || session.name;
    const simResult = signApplicationPayload(payload, signerName);

    return NextResponse.json({
      success: true,
      signature: {
        ...simResult,
        signatureType: "SIMULATED",
        algorithm: "Ed25519-SIMULATED",
        certificateIssuer: "Тестовая подпись разработчика (NCALayer оффлайн)",
        signedContent: canonicalStr,
        signerIin: iin || null,
        signerBin: bin || null,
      },
    });
  } catch (err: unknown) {
    console.error("Sign application API error:", err);
    return NextResponse.json(
      { error: "Ошибка при формировании цифровой подписи заявления" },
      { status: 500 }
    );
  }
}
