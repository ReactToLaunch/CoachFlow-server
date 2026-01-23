import {Router } from "express";
import {RegisterAdmin, loginAdmin, } from "../controllers/admin.controller.js";



const router = Router();

router.route("/registerAdmin").post(RegisterAdmin)
router.route("/loginAdmin").post(loginAdmin)


export default router;

