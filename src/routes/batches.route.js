import { Router } from "express";
import { protectAdmin } from "../middlewares/authMiddleware.js";
import { CreateBatch, getAllBatches, getBatchById, updateBatch } from "../controllers/batches.controller.js";


const router = Router();

router.route("/createBatch").post(protectAdmin,CreateBatch)
router.route("/getAllBatches").get(protectAdmin,getAllBatches)
router.route("/getBatchById/:id").get(protectAdmin,getBatchById)
router.route("/updateBatch/:id").put(protectAdmin,updateBatch)

export default router;