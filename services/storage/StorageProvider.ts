import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredFileResult {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  fileUrl: string;
}

export interface IStorageProvider {
  name: string;
  saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<StoredFileResult>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalDiskStorageProvider implements IStorageProvider {
  name = "LocalDiskStorageProvider";
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<StoredFileResult> {
    const ext = path.extname(originalName) || ".dat";
    const checksumSha256 = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");
    
    // Generate safe unique filename to prevent path traversal or overwrites
    const uniqueName = `${checksumSha256.substring(0, 12)}-${Date.now()}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      filename: uniqueName,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      checksumSha256,
      fileUrl: `/uploads/${uniqueName}`,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }
}

// Global storage adapter instance (Can be swapped with AWS S3 / Azure Blob)
export const storageProvider: IStorageProvider = new LocalDiskStorageProvider();
