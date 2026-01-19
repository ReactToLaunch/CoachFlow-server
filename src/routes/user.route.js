import {Router} from "express";
import { registerUser, loginUser,Otpgenerate, getAllStudents, forgot_password,verifyOtp, reset_password } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/getStudents").get(getAllStudents)



// forgot password flow
router.route("/forgot-password").post(forgot_password);
router.route("/otp-generate").post(Otpgenerate);

router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(reset_password);


export default router;

