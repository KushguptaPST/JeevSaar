/**
 * Splits text into logical speech chunks at sentence boundaries.
 * Sarvam AI has a limit of ~2,500 characters per request.
 * We safely target a maximum of 1,800 characters per chunk.
 */
export function chunkTextAtSentenceBoundaries(
  text: string,
  maxCharsPerChunk = 1800
): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxCharsPerChunk) {
    return [trimmed];
  }

  // Regex to split on Indic Purna Viram (।), period, question mark, exclamation, or double newline
  // Keep the delimiter attached to the sentence
  const sentenceDelimiterRegex = /([^।\.?!;\n]+[।\.?!;\n]+)/g;
  const rawMatches = trimmed.match(sentenceDelimiterRegex) || [trimmed];

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawMatches) {
    const candidate = currentChunk ? `${currentChunk} ${sentence.trim()}` : sentence.trim();

    if (candidate.length <= maxCharsPerChunk) {
      currentChunk = candidate;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If a single sentence exceeds maxCharsPerChunk, force split at word boundaries
      if (sentence.trim().length > maxCharsPerChunk) {
        const words = sentence.trim().split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).length <= maxCharsPerChunk) {
            wordChunk = wordChunk ? `${wordChunk} ${w}` : w;
          } else {
            chunks.push(wordChunk.trim());
            wordChunk = w;
          }
        }
        currentChunk = wordChunk;
      } else {
        currentChunk = sentence.trim();
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [trimmed];
}
