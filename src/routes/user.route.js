import { Router } from "express";
import { registerUser, loginUser, Otpgenerate, verifyOtp, resetPassword, SaveFcmToken } from "../controllers/user.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/resetPassword").post(protect, resetPassword);

router.route("/saveToken").put(protect, SaveFcmToken)


export default router;

