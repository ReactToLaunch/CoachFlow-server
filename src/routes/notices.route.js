import { Router } from "express";
import { createNotice, getAllNotices, getNoticeById } from "../controllers/notices.controller.js";
import { protectAdmin, protect } from "../middlewares/authMiddleware.js";

const router = Router();


router.route("/getNotices").get(protect, getAllNotices);
router.route("/getNoticesById/:id").get(protect, getNoticeById);
router.route("/create").post(protectAdmin, createNotice);


export default router;
