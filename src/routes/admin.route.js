import { Router } from "express";
import { RegisterAdmin, loginAdmin, generateAdminOtp, verifyAdminOtp, logoutAdmin } from "../controllers/admin.controller.js";



const router = Router();

router.route("/registerAdmin").post(RegisterAdmin)
router.route("/loginAdmin").post(loginAdmin) // Keep for backward compatibility

// New secure 2FA routes
router.route("/generate-otp").post(generateAdminOtp)
router.route("/verify-otp").post(verifyAdminOtp)

// Logout route
router.route("/logout").post(logoutAdmin)


export default router;
