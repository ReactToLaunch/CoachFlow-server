import { Router } from "express";
import { protectAdmin } from "../middlewares/authMiddleware.js";
import {  assignFees,  collectFee,  getDefaulters,  getStudentLedger} from "../controllers/fees.controller.js";

const router = Router();


router.use(protectAdmin);

router.post("/assign", assignFees);
router.post("/collect", collectFee);
router.get("/defaulters", getDefaulters);
router.get("/ledger/:studentId", getStudentLedger);

export default router;