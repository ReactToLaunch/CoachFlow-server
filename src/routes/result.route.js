import { Router } from "express";
import { upload } from "../utils/multer.js";
import { SaveResult, SaveTimeTable } from "../controllers/results.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/save-result").post(upload.single("result"), protectAdmin, SaveResult);
router.route("/save-timetable").post(upload.single("timetable"), protectAdmin, SaveTimeTable);

export default router;
