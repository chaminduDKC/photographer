import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function main() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
