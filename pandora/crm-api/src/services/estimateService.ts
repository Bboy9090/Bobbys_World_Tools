import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateEstimateForTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      device: true,
      diagnosticRuns: {
        include: { findings: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!ticket || !ticket.device) throw new Error("Ticket or device not found");
  const run = ticket.diagnosticRuns[0];
  if (!run) throw new Error("No diagnostic run for ticket");

  const findings = run.findings;
  const partsToAdd: { partId: string; qty: number }[] = [];
  const laborLines: { description: string; minutes: number; rateCents: number }[] = [];

  const storageFull = findings.some(f => f.code === "STORAGE_NEAR_FULL");
  const batteryHot = findings.some(f => f.code === "BATTERY_OVERHEATING" || f.code === "BATTERY_HOT");

  if (batteryHot) {
    const batteryPart = await prisma.part.findFirst({
      where: {
        category: "battery",
        compatibleOem: ticket.device.oem ?? undefined,
      },
    });
    if (batteryPart) {
      partsToAdd.push({ partId: batteryPart.id, qty: 1 });
    }
    laborLines.push({
      description: "Battery replacement and thermal check",
      minutes: 45,
      rateCents: 15000,
    });
  }

  if (storageFull) {
    laborLines.push({
      description: "Full device backup and storage cleanup / reset",
      minutes: 60,
      rateCents: 15000,
    });
  }

  for (const p of partsToAdd) {
    const part = await prisma.part.findUnique({ where: { id: p.partId } });
    if (!part) continue;
    await prisma.ticketPart.create({
      data: {
        ticketId,
        partId: part.id,
        quantity: p.qty,
        linePriceCents: part.sellPriceCents * p.qty,
      },
    });
  }

  for (const l of laborLines) {
    const linePrice = Math.round((l.minutes / 60) * l.rateCents);
    await prisma.ticketLabor.create({
      data: {
        ticketId,
        description: l.description,
        minutes: l.minutes,
        rateCents: l.rateCents,
        linePriceCents: linePrice,
      },
    });
  }

  const parts = await prisma.ticketPart.findMany({
    where: { ticketId },
    include: { part: true },
  });
  const labor = await prisma.ticketLabor.findMany({ where: { ticketId } });

  const partsTotal = parts.reduce((sum, p) => sum + p.linePriceCents, 0);
  const laborTotal = labor.reduce((sum, l) => sum + l.linePriceCents, 0);

  return {
    ticketId,
    parts: parts.map(p => ({
      name: p.part.name,
      quantity: p.quantity,
      linePriceCents: p.linePriceCents,
    })),
    labor: labor.map(l => ({
      description: l.description,
      minutes: l.minutes,
      linePriceCents: l.linePriceCents,
    })),
    totals: {
      partsTotalCents: partsTotal,
      laborTotalCents: laborTotal,
      grandTotalCents: partsTotal + laborTotal,
    },
  };
}
