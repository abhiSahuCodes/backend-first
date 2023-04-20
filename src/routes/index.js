import {Router} from "express";
import authRoutes from "./auth.routes.js"

const router = Router();

//The starting "/" is very important
router.use("/auth", authRoutes)

export default router;