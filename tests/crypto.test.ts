import { describe, it, expect } from "vitest";
import {
  canonicalizeJson,
  computeSha256,
  signApplicationPayload,
  verifyDigitalSignature,
  SignaturePayload,
} from "../lib/crypto";

describe("Cryptographic Core (lib/crypto.ts)", () => {
  describe("canonicalizeJson", () => {
    it("should deterministically sort object keys regardless of original insertion order", () => {
      const objA = { z: 1, a: 2, m: { y: "test", b: 42 } };
      const objB = { a: 2, m: { b: 42, y: "test" }, z: 1 };

      const canonA = canonicalizeJson(objA);
      const canonB = canonicalizeJson(objB);

      expect(canonA).toBe(canonB);
      expect(canonA).toBe('{"a":2,"m":{"b":42,"y":"test"},"z":1}');
    });

    it("should handle arrays, primitives, and nulls properly", () => {
      expect(canonicalizeJson(null)).toBe("null");
      expect(canonicalizeJson(1234)).toBe("1234");
      expect(canonicalizeJson("flexora")).toBe('"flexora"');
      expect(canonicalizeJson([3, 2, 1])).toBe("[3,2,1]");
    });
  });

  describe("computeSha256", () => {
    it("should compute valid 64-character hex digest", () => {
      const digest = computeSha256("flexora-license-data");
      expect(digest).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);

      // Recomputation should be strictly deterministic
      expect(computeSha256("flexora-license-data")).toBe(digest);
    });

    it("should produce different digests for different inputs", () => {
      expect(computeSha256("payload-A")).not.toBe(computeSha256("payload-B"));
    });
  });

  describe("signApplicationPayload & verifyDigitalSignature (Ed25519)", () => {
    const samplePayload: SignaturePayload = {
      applicationId: "LIC-2026-TEST01",
      softwareName: "FleXora Enterprise Suite",
      softwareVersion: "v3.0.0",
      developer: "FleXora Technologies",
      licenseType: "Commercial",
      licenseDuration: "1 Year",
      numUsers: 25,
      documents: [
        {
          filename: "architecture_spec.pdf",
          checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      ],
      signerEmail: "security@flexora.io",
    };

    it("should sign a valid payload and verify successfully", () => {
      const sigResult = signApplicationPayload(samplePayload, "Alice Developer");

      expect(sigResult.isVerified).toBe(true);
      expect(sigResult.algorithm).toBe("Ed25519-SHA256-SIMULATED");
      expect(sigResult.signature).toBeDefined();
      expect(sigResult.payloadHash).toHaveLength(64);
      expect(sigResult.verificationId).toContain("SIG-");

      // Verify the generated signature
      const isValid = verifyDigitalSignature(
        samplePayload,
        sigResult.payloadHash,
        sigResult.signature
      );

      expect(isValid).toBe(true);
    });

    it("should fail verification if any payload property is tampered with", () => {
      const sigResult = signApplicationPayload(samplePayload, "Alice Developer");

      // Tamper: attacker secretly increases numUsers from 25 to 500
      const tamperedPayload: SignaturePayload = {
        ...samplePayload,
        numUsers: 500,
      };

      const isValid = verifyDigitalSignature(
        tamperedPayload,
        sigResult.payloadHash,
        sigResult.signature
      );

      expect(isValid).toBe(false);
    });

    it("should fail verification if attached document checksum is altered", () => {
      const sigResult = signApplicationPayload(samplePayload, "Alice Developer");

      // Tamper: attacker substitutes different document file checksum
      const tamperedPayload: SignaturePayload = {
        ...samplePayload,
        documents: [
          {
            filename: "architecture_spec.pdf",
            checksumSha256: "0000000000000000000000000000000000000000000000000000000000000000",
          },
        ],
      };

      const isValid = verifyDigitalSignature(
        tamperedPayload,
        sigResult.payloadHash,
        sigResult.signature
      );

      expect(isValid).toBe(false);
    });

    it("should fail gracefully if signature is corrupted or invalid hex", () => {
      const sigResult = signApplicationPayload(samplePayload, "Alice Developer");

      // Corrupt signature hex string
      const corruptedSignature = "BAD0" + sigResult.signature.substring(4);

      const isValid = verifyDigitalSignature(
        samplePayload,
        sigResult.payloadHash,
        corruptedSignature
      );

      expect(isValid).toBe(false);

      // Completely non-hex string should not crash server
      const isSafe = verifyDigitalSignature(samplePayload, sigResult.payloadHash, "NOT_HEX_DATA");
      expect(isSafe).toBe(false);
    });
  });
});
