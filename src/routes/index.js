import {Router} from "express";
import authRoutes from "./auth.routes.js"
import couponRoutes from "./coupon.route.js"

const router = Router();

//The starting "/" is very important
router.use("/auth", authRoutes)
router.use("/coupon", couponRoutes)


export default router;