import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config';

export interface SaveFileInput {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  subfolder?: string;
}

export interface StoredFileResult {
  filename: string;
  storagePath: string;
  fileUrl: string;
  sizeBytes: number;
}

export interface StorageProvider {
  saveFile(input: SaveFileInput): Promise<StoredFileResult>;
  readFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = config.uploadAbsoluteDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(input: SaveFileInput): Promise<StoredFileResult> {
    const subfolder = input.subfolder || 'general';
    const targetFolder = path.join(this.baseDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const ext = path.extname(input.originalFilename) || '.bin';
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${Date.now()}-${randomHex}${ext}`;
    const absolutePath = path.join(targetFolder, safeFilename);

    await fs.promises.writeFile(absolutePath, input.buffer);

    const relativePath = path.join(subfolder, safeFilename);
    const fileUrl = `/uploads/${subfolder}/${safeFilename}`;

    return {
      filename: safeFilename,
      storagePath: relativePath,
      fileUrl,
      sizeBytes: input.buffer.length,
    };
  }

  async readFile(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, storagePath);
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, storagePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      console.warn(`Failed to delete file at ${storagePath}:`, err);
    }
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
