import { pruneAudioCache } from '../src/services/cache-pruner';

describe('Audio Cache Pruner Service', () => {
  it('executes pruneAudioCache successfully without unhandled errors', async () => {
    const result = await pruneAudioCache(30);
    expect(result).toBeDefined();
    expect(typeof result.recordsDeleted).toBe('number');
    expect(typeof result.filesDeleted).toBe('number');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
