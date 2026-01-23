import {Router } from "express";
import {RegisterAdmin, loginAdmin, CreateBatch, getAllBatches} from "../controllers/admin.controller.js";



const router = Router();

router.route("/registerAdmin").post(RegisterAdmin)
router.route("/loginAdmin").post(loginAdmin)
router.route("/createBatch").post(CreateBatch)
router.route("/getAllBatches").get(getAllBatches)

export default router;