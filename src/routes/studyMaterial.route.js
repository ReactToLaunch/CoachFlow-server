import {sendStudyMaterial, getBatchMaterials } from "../controllers/studyMaterial.controller";
import {Router} from "express";
import {protectAdmin, protect} from "../middlewares/authMiddleware"

const router = Router()


router.route("/sendStudyMaterial").post(protectAdmin, sendStudyMaterial);
router.route("/getMaterial/:batchId").get(protect, getBatchMaterials);