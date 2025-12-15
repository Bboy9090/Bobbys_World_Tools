import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: String(search), mode: "insensitive" } },
              { phone: { contains: String(search) } },
              { email: { contains: String(search), mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        devices: {
          select: { id: true, platform: true, model: true },
        },
        tickets: {
          where: { status: { notIn: ["done", "cancelled"] } },
          select: { id: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    res.json({ customers });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        devices: {
          include: {
            diagnosticRuns: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            device: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const customer = await prisma.customer.create({
      data: { name, phone, email },
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone, email },
    });

    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
