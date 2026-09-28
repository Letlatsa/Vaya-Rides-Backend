import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import prisma from "../../config/prisma";
import { z } from "zod";

const router = Router();


const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
});

router.post("/me/location", authenticate, authorize("DRIVER"), async (req: AuthRequest, res) => {
  const parsed = locationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
  if (!driver) return res.status(404).json({ error: "DRIVER_NOT_FOUND" });

  const { latitude, longitude, accuracy } = parsed.data;

  const location = await prisma.driverLocation.upsert({
    where: { driverId: driver.id },
    update: { latitude, longitude, accuracy },
    create: { driverId: driver.id, latitude, longitude, accuracy },
  });

  res.json(location);
});

// Driver views their own profile + approval status
router.get("/me", authenticate, authorize("DRIVER"), async (req: AuthRequest, res) => {
  const driver = await prisma.driver.findUnique({
    where: { userId: req.user!.userId },
    include: { vehicle: true },
  });
  if (!driver) return res.status(404).json({ error: "DRIVER_NOT_FOUND" });
  res.json(driver);
});

// Driver toggles online/offline — only allowed if APPROVED
router.patch("/me/status", authenticate, authorize("DRIVER"), async (req: AuthRequest, res) => {
  const { isOnline } = req.body as { isOnline: boolean };

  const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
  if (!driver) return res.status(404).json({ error: "DRIVER_NOT_FOUND" });

  if (driver.approvalStatus !== "APPROVED") {
    return res.status(403).json({ error: "DRIVER_NOT_APPROVED" });
  }

  const updated = await prisma.driver.update({
    where: { userId: req.user!.userId },
    data: { isOnline, isAvailable: isOnline }, // available follows online for MVP1
  });

  res.json(updated);
});

export default router;