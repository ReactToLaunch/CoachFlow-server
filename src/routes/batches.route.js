import { Router } from "express";

import { CreateBatch, getAllBatches, getBatchById, updateBatch } from "../controllers/batches.controller.js";


const router = Router();

router.route("/createBatch").post(CreateBatch)
router.route("/getAllBatches").get(getAllBatches)
router.route("/getBatchById/:id").get(getBatchById)
router.route("/updateBatch/:id").put(updateBatch)

export default router;