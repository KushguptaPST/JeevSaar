import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ttsProvider } from '../providers/tts';

const ttsRequestSchema = z.object({
  text: z.string().min(1, 'Text is required for audio synthesis'),
  language: z.string().default('hi'),
  speaker: z.string().optional(),
});

export async function ttsRoutes(fastify: FastifyInstance) {
  fastify.post('/tts', async (request, reply) => {
    const parseResult = ttsRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid TTS input',
        details: parseResult.error.errors,
      });
    }

    const { text, language, speaker } = parseResult.data;

    try {
      const result = await ttsProvider.synthesize({
        text,
        language,
        speaker,
      });

      return reply.send(result);
    } catch (err: any) {
      fastify.log.error(err, 'TTS Synthesis error');
      return reply.status(500).send({
        error: 'TTS Synthesis Failed',
        message: err.message || 'Unable to generate audio speech',
      });
    }
  });
}
