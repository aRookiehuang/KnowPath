import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/config/database';

function buildAdminEmail(name: string): string {
  return `${name}@wenflow.local`;
}

async function main() {
  const [, , nameArg, passwordArg, emailArg] = process.argv;

  if (!nameArg || !passwordArg) {
    console.log('用法: npx ts-node scripts/create-admin.ts <用户名> <密码> [邮箱]');
    process.exit(1);
  }

  const name = nameArg.trim();
  const password = passwordArg.trim();
  const email = (emailArg?.trim() || buildAdminEmail(name)).toLowerCase();

  if (password.length < 6) {
    console.error('密码至少需要 6 位');
    process.exit(1);
  }

  const now = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.users.findFirst({
    where: {
      OR: [
        { name },
        { email },
      ],
    },
  });

  if (existingAdmin) {
    const updated = await prisma.users.update({
      where: { id: existingAdmin.id },
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isAdmin: true,
        updatedAt: now,
      },
    });

    console.log('管理员账号已存在，已更新为管理员并重置密码');
    console.log(`ID: ${updated.id}`);
    console.log(`用户名: ${updated.name}`);
    console.log(`邮箱: ${updated.email}`);
    console.log(`密码: ${password}`);
  } else {
    const created = await prisma.users.create({
      data: {
        id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isAdmin: true,
        xp: 0,
        currentLevel: 'beginner',
        createdAt: now,
        updatedAt: now,
      },
    });

    console.log('管理员账号创建成功');
    console.log(`ID: ${created.id}`);
    console.log(`用户名: ${created.name}`);
    console.log(`邮箱: ${created.email}`);
    console.log(`密码: ${password}`);
  }
}

main()
  .catch((error) => {
    console.error('创建管理员失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
