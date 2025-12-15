/// <reference types="node" />
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const customer1 = await prisma.customer.upsert({
    where: { id: "customer-1" },
    update: {},
    create: {
      id: "customer-1",
      name: "John Smith",
      phone: "555-0101",
      email: "john.smith@email.com",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "customer-2" },
    update: {},
    create: {
      id: "customer-2",
      name: "Sarah Johnson",
      phone: "555-0102",
      email: "sarah.j@email.com",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { id: "customer-3" },
    update: {},
    create: {
      id: "customer-3",
      name: "Mike Chen",
      phone: "555-0103",
      email: "mike.chen@email.com",
    },
  });

  console.log("Created customers:", customer1.name, customer2.name, customer3.name);

  const device1 = await prisma.device.upsert({
    where: { id: "device-1" },
    update: {},
    create: {
      id: "device-1",
      customerId: customer1.id,
      platform: "android",
      oem: "Samsung",
      model: "Galaxy S22 Ultra",
      serial: "R5CR123ABC",
      imei: "123456789012345",
      label: "John's Phone",
    },
  });

  const device2 = await prisma.device.upsert({
    where: { id: "device-2" },
    update: {},
    create: {
      id: "device-2",
      customerId: customer2.id,
      platform: "android",
      oem: "Google",
      model: "Pixel 8 Pro",
      serial: "28A4X1234",
      imei: "987654321098765",
      label: "Sarah's Pixel",
    },
  });

  const device3 = await prisma.device.upsert({
    where: { id: "device-3" },
    update: {},
    create: {
      id: "device-3",
      customerId: customer3.id,
      platform: "android",
      oem: "Motorola",
      model: "Moto G Play 2023",
      serial: "ZY32X4567",
      imei: "456789012345678",
      label: "Mike's Moto",
    },
  });

  const device4 = await prisma.device.upsert({
    where: { id: "device-4" },
    update: {},
    create: {
      id: "device-4",
      customerId: customer1.id,
      platform: "ios",
      oem: "Apple",
      model: "iPhone 14 Pro",
      serial: "F4GH123456",
      imei: "111222333444555",
      label: "John's iPhone",
    },
  });

  console.log("Created devices:", device1.model, device2.model, device3.model, device4.model);

  const ticket1 = await prisma.ticket.upsert({
    where: { id: "ticket-1" },
    update: {},
    create: {
      id: "ticket-1",
      customerId: customer1.id,
      deviceId: device1.id,
      status: "diagnosing",
      issueSummary: "Battery draining quickly, overheating",
      notes: "Customer reports phone getting hot during charging",
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { id: "ticket-2" },
    update: {},
    create: {
      id: "ticket-2",
      customerId: customer2.id,
      deviceId: device2.id,
      status: "repairing",
      issueSummary: "Cracked screen replacement",
      notes: "Front glass shattered, touch still working",
    },
  });

  const ticket3 = await prisma.ticket.upsert({
    where: { id: "ticket-3" },
    update: {},
    create: {
      id: "ticket-3",
      customerId: customer3.id,
      deviceId: device3.id,
      status: "intake",
      issueSummary: "Slow performance, storage full",
      notes: "Customer wants debloat and cleanup",
    },
  });

  const ticket4 = await prisma.ticket.upsert({
    where: { id: "ticket-4" },
    update: {},
    create: {
      id: "ticket-4",
      customerId: customer1.id,
      deviceId: device4.id,
      status: "done",
      issueSummary: "Battery replacement",
      notes: "Completed successfully",
    },
  });

  console.log("Created tickets:", ticket1.id, ticket2.id, ticket3.id, ticket4.id);

  const run1 = await prisma.diagnosticRun.upsert({
    where: { id: "run-1" },
    update: {},
    create: {
      id: "run-1",
      deviceId: device1.id,
      ticketId: ticket1.id,
      status: "completed",
      summary: "Battery health degraded, thermal issues detected",
    },
  });

  await prisma.diagnosticFinding.upsert({
    where: { id: "finding-1" },
    update: {},
    create: {
      id: "finding-1",
      runId: run1.id,
      level: "warning",
      code: "BATTERY_HEALTH",
      message: JSON.stringify({
        percent_estimate: 72,
        condition: "GOOD",
        cycle_count: 450,
      }),
      source: "android_battery",
    },
  });

  await prisma.diagnosticFinding.upsert({
    where: { id: "finding-2" },
    update: {},
    create: {
      id: "finding-2",
      runId: run1.id,
      level: "critical",
      code: "BATTERY_TEMP",
      message: JSON.stringify({ temperature: 46, unit: "C" }),
      source: "android_battery",
    },
  });

  await prisma.diagnosticFinding.upsert({
    where: { id: "finding-3" },
    update: {},
    create: {
      id: "finding-3",
      runId: run1.id,
      level: "info",
      code: "STORAGE_USAGE",
      message: JSON.stringify({ used: "95GB", available: "33GB", percent: 74 }),
      source: "android_storage",
    },
  });

  const run2 = await prisma.diagnosticRun.upsert({
    where: { id: "run-2" },
    update: {},
    create: {
      id: "run-2",
      deviceId: device2.id,
      ticketId: ticket2.id,
      status: "completed",
      summary: "Screen hardware damage, device otherwise healthy",
    },
  });

  await prisma.diagnosticFinding.upsert({
    where: { id: "finding-4" },
    update: {},
    create: {
      id: "finding-4",
      runId: run2.id,
      level: "info",
      code: "BATTERY_HEALTH",
      message: JSON.stringify({
        percent_estimate: 91,
        condition: "GOOD",
        cycle_count: 120,
      }),
      source: "android_battery",
    },
  });

  await prisma.diagnosticFinding.upsert({
    where: { id: "finding-5" },
    update: {},
    create: {
      id: "finding-5",
      runId: run2.id,
      level: "critical",
      code: "SCREEN_DAMAGE",
      message: JSON.stringify({ damage: "cracked_glass", touch_working: true }),
      source: "hardware_inspection",
    },
  });

  console.log("Created diagnostic runs with findings");

  const part1 = await prisma.part.upsert({
    where: { sku: "BAT-SAM-S22U" },
    update: {},
    create: {
      sku: "BAT-SAM-S22U",
      name: "Samsung S22 Ultra Battery",
      category: "battery",
      compatibleOem: "Samsung",
      compatibleModel: "Galaxy S22 Ultra",
      costPriceCents: 2500,
      sellPriceCents: 4999,
      stockQuantity: 5,
      minStockAlert: 2,
    },
  });

  const part2 = await prisma.part.upsert({
    where: { sku: "SCR-PIX-8P" },
    update: {},
    create: {
      sku: "SCR-PIX-8P",
      name: "Pixel 8 Pro OLED Screen Assembly",
      category: "screen",
      compatibleOem: "Google",
      compatibleModel: "Pixel 8 Pro",
      costPriceCents: 12000,
      sellPriceCents: 19999,
      stockQuantity: 3,
      minStockAlert: 1,
    },
  });

  const part3 = await prisma.part.upsert({
    where: { sku: "BAT-APL-IP14P" },
    update: {},
    create: {
      sku: "BAT-APL-IP14P",
      name: "iPhone 14 Pro Battery",
      category: "battery",
      compatibleOem: "Apple",
      compatibleModel: "iPhone 14 Pro",
      costPriceCents: 3000,
      sellPriceCents: 5999,
      stockQuantity: 8,
      minStockAlert: 3,
    },
  });

  console.log("Created parts:", part1.name, part2.name, part3.name);

  await prisma.ticketPart.upsert({
    where: { id: "tp-1" },
    update: {},
    create: {
      id: "tp-1",
      ticketId: ticket2.id,
      partId: part2.id,
      quantity: 1,
      linePriceCents: 19999,
    },
  });

  await prisma.ticketLabor.upsert({
    where: { id: "tl-1" },
    update: {},
    create: {
      id: "tl-1",
      ticketId: ticket2.id,
      description: "Screen replacement labor",
      minutes: 45,
      rateCents: 100,
      linePriceCents: 7500,
    },
  });

  console.log("Created ticket parts and labor");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
