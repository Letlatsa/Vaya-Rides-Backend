import { Router } from "express";
import { registerUser, loginUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const user = await registerUser(parsed.data);
    res.status(201).json({ id: user.id, phone: user.phone, role: user.role });
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const { user, accessToken, refreshToken } = await loginUser(parsed.data.phone, parsed.data.password);
    res.json({ accessToken, refreshToken, user: { id: user.id, role: user.role } });
  } catch {
    res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }
});

export default router;