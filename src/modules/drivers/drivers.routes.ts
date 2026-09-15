import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import prisma from "../../config/prisma";

const router = Router();

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