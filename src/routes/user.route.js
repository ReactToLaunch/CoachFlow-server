import {Router} from "express";
import { registerUser, loginUser,Otpgenerate, verifyOtp, resetPassword} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/otp-generate").post(Otpgenerate);

router.route("/verify-otp").post(verifyOtp);
router.route("/resetPassword").post(resetPassword);


export default router;

