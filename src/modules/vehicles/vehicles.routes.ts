import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import prisma from "../../config/prisma";

const router = Router();

router.post("/", authenticate, authorize("DRIVER"), async (req: AuthRequest, res) => {
  const { make, model, year, colour, registration } = req.body;

  const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
  if (!driver) return res.status(404).json({ error: "DRIVER_NOT_FOUND" });

  const existingVehicle = await prisma.vehicle.findUnique({ where: { driverId: driver.id } });
  if (existingVehicle) return res.status(409).json({ error: "VEHICLE_ALREADY_REGISTERED" });

  const vehicle = await prisma.vehicle.create({
    data: { driverId: driver.id, make, model, year, colour, registration },
  });

  res.status(201).json(vehicle);
});

export default router;