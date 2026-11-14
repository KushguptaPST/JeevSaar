import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; phone: string; role?: string };
    user: { userId: string; phone: string; role?: string };
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Valid authentication token is required',
      });
    }
  });

  fastify.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    const adminToken = request.headers['x-admin-token'];
    if (!adminToken || adminToken !== config.ADMIN_API_TOKEN) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing admin authentication token',
      });
    }
  });
};

export const authPlugin = fp(authPluginAsync);
