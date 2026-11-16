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
  const sections = [
    {
      page: "home",
      sectionKey: "hero",
      title: "Future Hub Myanmar",
      subtitle: "Welcome to our website",
      description: "Explore more",
      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "home",
      sectionKey: "about call to action",
      title: "Why Choose Us",
      subtitle: "Our Core Features",
      description:
        "Explore the amazing tools and capabilities we provide to scale your business.",
    },
    {
      page: "home",
      sectionKey: "contact call to action",
      title: "Contact",
      subtitle: "Share knowledge",
      description: "Contact us",
    },
    {
      page: "home",
      sectionKey: "roadmap",
      title: "Our Software Development Journey ",
      subtitle: "From Ideas to Delivery, We Bring Vision to Life.",
    },
    {
      page: "home",
      sectionKey: "technology ",
      title: "Our Technology",
    },
    {
      page: "home",
      sectionKey: "partner & project",
      title: "Premier Partner & Success Stories",
    },
    {
      page: "about",
      sectionKey: "hero",
      title: "About Our Company",
      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "about",
      sectionKey: "mission",
      title: "Mission",
      description: "",
    },
    {
      page: "about",
      sectionKey: "vision",
      title: "Our vision",
      description: "",
    },
    {
      page: "about",
      sectionKey: "why choose us",
      title: "Why choose us",
      description: "",
    },
    {
      page: "about",
      sectionKey: "team",
      title: "Meet our team",
      description: "",
      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "contact",
      sectionKey: "hero",
      title: "Contact us",
      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "contact",
      sectionKey: "info",
      title: "Information box",
      subtitle: "",
    },
    {
      page: "contact",
      sectionKey: "contact-box",
      title: "contact Form",
      subtitle: "",
    },
    {
      page: "gallery",
      sectionKey: "hero",
      title: "Gallery",
      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "gallery",
      sectionKey: "header",
      title: "Our memory",
      subtitle: "",
      description: "",
    },
    {
      page: "project",
      sectionKey: "hero",
      title: "Partner and Project",

      imageUrl: "/images/home-hero.jpg",
    },
    {
      page: "project",
      sectionKey: "header",
      title: "",
      description: "",
    },
  ];

  // Page Sections တွေ Seed လုပ်ခြင်း (findFirst နဲ့ update/create သုံးခြင်း)
  for (const sec of sections) {
    const existingSection = await prisma.pageSectionEditable.findFirst({
      where: {
        page: sec.page,
        sectionKey: sec.sectionKey,
      },
    });

    if (existingSection) {
      // ရှိပြီးသားဆိုရင် update လုပ်မယ်
      await prisma.pageSectionEditable.update({
        where: { id: existingSection.id },
        data: {
          title: sec.title,
          subtitle: sec.subtitle,
          description: sec.description,
          imageUrl: sec.imageUrl,
        },
      });
    } else {
      // မရှိသေးရင် အသစ် create လုပ်မယ်
      await prisma.pageSectionEditable.create({
        data: sec,
      });
    }
  }
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
