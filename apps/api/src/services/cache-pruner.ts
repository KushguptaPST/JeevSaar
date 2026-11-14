import { PrismaClient } from '@prisma/client';
import { storageProvider } from '../providers/storage';

const prisma = new PrismaClient();

export interface PruneResult {
  recordsDeleted: number;
  filesDeleted: number;
  errors: string[];
}

/**
 * Prunes audio cache entries older than maxAgeDays (default: 30 days)
 * to comply with the privacy consent notice and data minimization policy.
 */
export async function pruneAudioCache(maxAgeDays: number = 30): Promise<PruneResult> {
  const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const errors: string[] = [];
  let filesDeleted = 0;

  try {
    const expiredRecords = await prisma.audioCache.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    for (const record of expiredRecords) {
      try {
        await storageProvider.deleteFile(record.filePath);
        filesDeleted++;
      } catch (err: any) {
        errors.push(`Failed to delete audio file ${record.filePath}: ${err.message}`);
      }
    }

    const deleteResult = await prisma.audioCache.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      recordsDeleted: deleteResult.count,
      filesDeleted,
      errors,
    };
  } catch (error: any) {
    errors.push(`Database error during cache pruning: ${error.message}`);
    return {
      recordsDeleted: 0,
      filesDeleted,
      errors,
    };
  }
}
