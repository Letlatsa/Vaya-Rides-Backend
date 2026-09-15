import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import prisma from "../../config/prisma";

const router = Router();

router.use(authenticate, authorize("ADMIN")); // applies to every route below

router.get("/drivers", async (_req, res) => {
  const drivers = await prisma.driver.findMany({ include: { user: true, vehicle: true } });
  res.json(drivers);
});

router.patch("/drivers/:id/approve", async (req, res) => {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { approvalStatus: "APPROVED" },
    });
    res.json(driver);
  } catch (err: any) {
    res.status(404).json({ error: "DRIVER_NOT_FOUND", details: err.message });
  }
});

router.patch("/drivers/:id/reject", async (req, res) => {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { approvalStatus: "REJECTED" },
    });
    res.json(driver);
  } catch (err: any) {
    res.status(404).json({ error: "DRIVER_NOT_FOUND", details: err.message });
  }
});

export default router;