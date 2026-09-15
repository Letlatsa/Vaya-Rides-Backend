import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { createRideSchema } from "./ride.schema";
import { createRide, transitionRideStatus } from "./rides.service";
import prisma from "../../config/prisma";

const router = Router();

router.post("/", authenticate, authorize("PASSENGER"), async (req: AuthRequest, res) => {
  const parsed = createRideSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const ride = await createRide(req.user!.userId, parsed.data);
    res.status(201).json(ride);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  const rideId = req.params.id as string;
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) return res.status(404).json({ error: "RIDE_NOT_FOUND" });
  res.json(ride);
});

router.patch("/:id/cancel", authenticate, async (req: AuthRequest, res) => {
  try {
    const rideId = req.params.id as string;
    const ride = await transitionRideStatus(rideId, "CANCELLED");
    res.json(ride);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;