import { StudyMaterial } from "../models/studyMaterial.model.js";
import { Batch } from "../models/batch.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const sendStudyMaterial = asyncHandler(async (req, res) => {
    
   
    if (req.user.selectedRole !== "admin") {
        throw new ApiError(403, "Access Denied. Only Admins can upload material.");
    }

    const { title, description, subject, batchId } = req.body;

    
    if ([title, subject, batchId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title, Subject, and Batch ID are required");
    }

   
    const validBatch = await Batch.findById(batchId);
    if (!validBatch) {
        throw new ApiError(404, "Invalid Batch ID");
    }


    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "File is required (PDF/Image)");
    }

 
    const uploadedFile = await uploadOnCloudinary(localFilePath);
    if (!uploadedFile) {
        throw new ApiError(500, "Failed to upload file to cloud");
    }

    
    const studyMaterial = await StudyMaterial.create({
        title,
        description,
        subject,
        batch: batchId,
        fileUrl: uploadedFile.url,       
        cloudinaryId: uploadedFile.public_id, 
        fileType: "PDF", 
        uploadedBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, studyMaterial, "Study Material Uploaded Successfully")
    );
});


const getBatchMaterials = asyncHandler(async (req, res) => {
    
    
    const { batchId, subject } = req.query;

    if (!batchId) {
        throw new ApiError(400, "Batch ID is required to fetch materials");
    }

    
    const filter = { batch: batchId };
    
   
    if (subject) {
        filter.subject = subject.toUpperCase();
    }

    const materials = await StudyMaterial.find(filter)
        .sort({ createdAt: -1 }); 

    return res.status(200).json(
        new ApiResponse(200, materials, "Study Materials Fetched Successfully")
    );
});

export { sendStudyMaterial, getBatchMaterials };