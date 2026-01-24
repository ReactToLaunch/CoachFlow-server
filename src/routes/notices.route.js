import { Router } from "express";
import { createNotice, getAllNotices, getNoticeById } from "../controllers/notices.controller.js";
import { protectAdmin, protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Student routes - get notices for their batch
router.route("/").get(protect, getAllNotices);
router.route("/:id").get(protect, getNoticeById);

// Admin routes - create notices
router.route("/create").post(protectAdmin, createNotice);


export default router;
