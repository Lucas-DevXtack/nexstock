import { app } from './app.js';
import { env } from './config/env.js';
import { seedDefaultUnits } from './modules/units/units.service.js';
import { prisma } from './shared/db/prisma.js';

let server: import('node:http').Server | null = null;

async function bootstrap() {
  try {
    console.log('[api] connecting to database...');
    await prisma.$connect();

    if (env.NODE_ENV !== 'production') {
      console.log('[api] seeding default units...');
      await seedDefaultUnits();
    }

    const port = Number(env.PORT || 3333);

    server = app.listen(port, () => {
      console.log(`[api] listening on :${port}`);
    });
  } catch (e) {
    console.error('[api] failed to start', e);
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  console.log(`[api] received ${signal}, shutting down...`);
  try {
    await new Promise<void>((resolve, reject) => {
      if (!server) return resolve();
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await prisma.$disconnect();
  } catch (e) {
    console.error('[api] error during shutdown', e);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('uncaughtException', (e) => {
  console.error('[api] uncaught exception', e);
});
process.on('unhandledRejection', (e) => {
  console.error('[api] unhandled rejection', e);
});

void bootstrap();
