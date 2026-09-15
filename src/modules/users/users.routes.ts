import { Router } from "express";
import { authenticate, AuthRequest } from "../../common/middleware/authenticate";
import prisma from "../../config/prisma";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, phone: true, email: true, role: true, status: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  res.json(user);
});

export default router;