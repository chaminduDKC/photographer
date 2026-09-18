import 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({ data: { email, passwordHash } });
  console.log(`✅ Admin created: ${admin.email} (${admin.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
