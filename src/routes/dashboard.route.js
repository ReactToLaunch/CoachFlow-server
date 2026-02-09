import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();


router.route("/stats").get(getDashboardStats);

export default router;
