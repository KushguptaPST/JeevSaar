import { buildApp } from './app';
import { config } from './config';

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    console.log(`\n🚀 ${config.app.appName} API running at: ${address}`);
    console.log(`🏥 Admin Hospital Desk available at: ${address}/admin`);
    console.log(`🩺 Health check at: ${address}/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
