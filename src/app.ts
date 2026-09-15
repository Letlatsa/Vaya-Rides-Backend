import express from "express";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import driversRoutes from "./modules/drivers/drivers.routes";
import adminRoutes from "./modules/admin/admin.routes";
import vehiclesRoutes from "./modules/vehicles/vehicles.routes";
import ridesRoutes from "./modules/rides/rides.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/drivers", driversRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/admin", adminRoutes);
app.use("/rides", ridesRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
export default app;