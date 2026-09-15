import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().min(8),
  email: z.string().email().optional(),
  password: z.string().min(8),
  role: z.enum(["PASSENGER", "DRIVER"]), // ADMIN is never self-registered
});

export const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(8),
});