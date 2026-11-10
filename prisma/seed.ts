import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Mkr@arvind98', salt);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'mkrcollege@gmail.com' },
    update: {
      passwordHash,
      name: 'Dr. Arvind Kumar (Super Admin / Principal)',
      role: 'SUPER_ADMIN',
      isActive: true,
      phone: '+91-7597052444',
    },
    create: {
      email: 'mkrcollege@gmail.com',
      passwordHash,
      name: 'Dr. Arvind Kumar (Super Admin / Principal)',
      role: 'SUPER_ADMIN',
      isActive: true,
      phone: '+91-7597052444',
    },
  });

  console.log('✓ Fixed Super Admin Seeded:', superAdmin.email, 'Role:', superAdmin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
