import { Router } from "express";
import { getProfile, login, logout, signUp, forgotPassword, resetPassword } from "../controller/auth.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";



const router = Router();

//The starting "/" is very important

router.post("/signUp", signUp)
router.post("/login", login)
router.get("/logout", logout)

//For forget password
router.post("/password/forgot/", forgotPassword)

//For reset password
router.post("/password/reset/:token", resetPassword)

//If somebody hits /profile, then it shouldn't provide profile instantly, rather
//isLoggedIn from middleware should verify it first
router.get("/profile", isLoggedIn, getProfile)

//If we want only the admin to see the profile:
// router.get("/profile", isLoggedIn, authorize(AuthRoles.ADMIN), getProfile)



export default router;