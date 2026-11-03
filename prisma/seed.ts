import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Initial Permissions ဆောက်ခြင်း
  const permissionsData = [
    {
      name: "manage_users",
      resource: "users",
      action: "manage",
      description: "User အားလုံးကို စီမံခန့်ခွဲခွင့်",
    },
    {
      name: "manage_roles",
      resource: "roles",
      action: "manage",
      description: "Role နဲ့ Permission များကို စီမံခန့်ခွဲခွင့်",
    },
    {
      name: "manage_products",
      resource: "products",
      action: "manage",
      description: "Product များကို စီမံခန့်ခွဲခွင့်",
    },
    {
      name: "manage_site_settings",
      resource: "site_settings",
      action: "manage",
      description: "Site Settings များကို ပြင်ဆင်ခွင့်",
    },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // 2. Roles ဆောက်ခြင်း
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      label: "Super Admin",
      description: "System တစ်ခုလုံးကို အပြည့်အဝ ထိန်းချုပ်ခွင့် ရှိသူ",
      isSystem: true,
    },
  });

  // 3. Super Admin User ဆောက်ခြင်း
  const hashedPassword = await bcrypt.hash("admin123456", 10); // default password
  const superAdminUser = await prisma.user.upsert({
    where: { email: "admin@futurehub.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@futurehub.com",
      passwordHash: hashedPassword,
      status: 1,
    },
  });

  // 4. Super Admin User နဲ့ Role ကို ချိတ်ဆက်ခြင်း (UserRole)
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
