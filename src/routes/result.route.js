import { Router } from "express";
import { upload } from "../utils/multer.js";
import { SaveResult, SaveTimeTable, getResult, getTimeTable } from "../controllers/results.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/save-result").post(upload.single("result"), protectAdmin, SaveResult);
router.route("/save-timetable").post(upload.single("timetable"), protectAdmin, SaveTimeTable);
router.route("/timetable/:batchId").get(protectAdmin, getTimeTable);
router.route("/results/:batchId").get( protectAdmin, getResult );

export default router;
