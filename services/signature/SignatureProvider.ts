import {
  DigitalSignatureResult,
  SignaturePayload,
  signApplicationPayload,
  verifyDigitalSignature,
} from "@/lib/crypto";

export interface ISignatureProvider {
  name: string;
  signPayload(payload: SignaturePayload, signerName: string): Promise<DigitalSignatureResult>;
  verifySignature(
    payload: SignaturePayload,
    expectedHash: string,
    signatureHex: string
  ): Promise<boolean>;
}

export class LocalSimulatedSignatureProvider implements ISignatureProvider {
  name = "Ed25519-SHA256-Simulated-Provider";

  async signPayload(
    payload: SignaturePayload,
    signerName: string
  ): Promise<DigitalSignatureResult> {
    return signApplicationPayload(payload, signerName);
  }

  async verifySignature(
    payload: SignaturePayload,
    expectedHash: string,
    signatureHex: string
  ): Promise<boolean> {
    return verifyDigitalSignature(payload, expectedHash, signatureHex);
  }
}

// Global adapter instance (Can be swapped with ECP / NCALayer adapter)
export const signatureProvider: ISignatureProvider = new LocalSimulatedSignatureProvider();
