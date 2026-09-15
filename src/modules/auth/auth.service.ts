import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function registerUser(data: { phone: string; email?: string; password: string; role: "PASSENGER" | "DRIVER" }) {
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existing) throw new Error("USER_ALREADY_EXISTS");

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      phone: data.phone,
      email: data.email,
      passwordHash,
      role: data.role,
    },
  });

  // If registering as a driver, create the linked Driver record in PENDING status
  if (data.role === "DRIVER") {
    await prisma.driver.create({ data: { userId: user.id } });
  }

  return user;
}

export async function loginUser(phone: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

  return { user, accessToken, refreshToken };
}