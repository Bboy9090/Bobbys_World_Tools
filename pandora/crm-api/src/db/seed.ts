import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with initial parts...");

  // Battery parts
  await prisma.part.create({
    data: {
      sku: "BATT-IPHONE-15",
      name: "iPhone 15 Pro Battery",
      category: "battery",
      compatibleOem: "Apple",
      compatibleModel: "iPhone 15 Pro",
      costPriceCents: 4500,
      sellPriceCents: 8900,
      stockQuantity: 10,
      minStockAlert: 2,
    },
  }).catch(() => console.log("iPhone 15 battery already exists"));

  await prisma.part.create({
    data: {
      sku: "BATT-SAMSUNG-S24",
      name: "Samsung Galaxy S24 Battery",
      category: "battery",
      compatibleOem: "Samsung",
      compatibleModel: "Galaxy S24",
      costPriceCents: 3500,
      sellPriceCents: 6990,
      stockQuantity: 8,
      minStockAlert: 2,
    },
  }).catch(() => console.log("Samsung S24 battery already exists"));

  // Screen parts
  await prisma.part.create({
    data: {
      sku: "SCREEN-IPHONE-15-OLED",
      name: "iPhone 15 OLED Display",
      category: "screen",
      compatibleOem: "Apple",
      compatibleModel: "iPhone 15 Pro",
      costPriceCents: 12000,
      sellPriceCents: 24900,
      stockQuantity: 5,
      minStockAlert: 1,
    },
  }).catch(() => console.log("iPhone 15 screen already exists"));

  // Storage modules
  await prisma.part.create({
    data: {
      sku: "STORAGE-SAMSUNG-256GB",
      name: "Samsung 256GB UFS Storage Module",
      category: "storage",
      compatibleOem: "Samsung",
      costPriceCents: 8000,
      sellPriceCents: 15900,
      stockQuantity: 3,
      minStockAlert: 1,
    },
  }).catch(() => console.log("Samsung storage already exists"));

  console.log("✓ Database seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
