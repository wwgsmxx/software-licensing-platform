import crypto from "crypto";

export interface SignaturePayload {
  applicationId: string;
  softwareName: string;
  softwareVersion: string;
  developer: string;
  licenseType: string;
  licenseDuration: string;
  numUsers: number;
  documents: { filename: string; checksumSha256: string }[];
  signerEmail: string;
  applicantType?: string;
  iin?: string;
  bin?: string;
  orgName?: string;
  representativeName?: string;
}

export interface DigitalSignatureResult {
  payloadHash: string;
  signature: string;
  algorithm: string;
  signatureType: "NCALAYER" | "APP_KEY" | "SIMULATED";
  keyFingerprint: string;
  verificationId: string;
  signerName: string;
  signerEmail: string;
  signerIin?: string;
  signerBin?: string;
  certificateIssuer?: string;
  certificateSerial?: string;
  signedAt: Date;
  isVerified: boolean;
}

/**
 * Deterministically canonicalize JSON payload (sort object keys alphabetically)
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJson).join(",") + "]";
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const sortedPairs = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalizeJson((obj as Record<string, unknown>)[k])}`
  );
  return "{" + sortedPairs.join(",") + "}";
}

/**
 * Compute SHA-256 Digest of canonicalized string
 */
export function computeSha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Server-side Keypair Generator for Simulated Cryptographic Signing
 */
const DEMO_KEY_PAIR = crypto.generateKeyPairSync("ed25519", {
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

export const SERVER_PUBLIC_KEY_FINGERPRINT = computeSha256(
  DEMO_KEY_PAIR.publicKey
).substring(0, 16).toUpperCase();

/**
 * Sign Application Payload with Ed25519 Asymmetric Signature Engine
 */
export function signApplicationPayload(
  payload: SignaturePayload,
  signerName: string
): DigitalSignatureResult {
  const canonicalStr = canonicalizeJson(payload);
  const payloadHash = computeSha256(canonicalStr);

  const signatureBuffer = crypto.sign(
    null,
    Buffer.from(payloadHash, "utf-8"),
    DEMO_KEY_PAIR.privateKey
  );

  const signatureHex = signatureBuffer.toString("hex").toUpperCase();
  const verificationId = `SIG-${payloadHash.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return {
    payloadHash,
    signature: signatureHex,
    algorithm: "Ed25519-SHA256-SIMULATED",
    signatureType: "SIMULATED",
    keyFingerprint: SERVER_PUBLIC_KEY_FINGERPRINT,
    verificationId,
    signerName,
    signerEmail: payload.signerEmail,
    signerIin: payload.iin,
    signerBin: payload.bin,
    signedAt: new Date(),
    isVerified: true,
  };
}

/**
 * Verify Digital Signature against Payload Hash
 */
export function verifyDigitalSignature(
  payload: SignaturePayload,
  expectedHash: string,
  signatureHex: string
): boolean {
  try {
    const canonicalStr = canonicalizeJson(payload);
    const recomputedHash = computeSha256(canonicalStr);

    if (recomputedHash !== expectedHash) {
      return false;
    }

    const isValid = crypto.verify(
      null,
      Buffer.from(recomputedHash, "utf-8"),
      DEMO_KEY_PAIR.publicKey,
      Buffer.from(signatureHex, "hex")
    );

    return isValid;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}
