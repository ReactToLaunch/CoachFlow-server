import { Router } from "express";
import { markAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.route("/mark").post(markAttendance);
export default router;