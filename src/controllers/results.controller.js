import { Result } from "../models/result.model.js";
import { TimeTable } from "../models/timetable.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const SaveResult = asyncHandler(async (req, res) => {
    
    
    const { title, batchId } = req.body; 

    if (!title || !batchId) {
        throw new ApiError(400, "Title and Batch ID are required");
    }

    
    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Result File is required");
    }

    
    const uploadedFile = await uploadOnCloudinary(localFilePath);
    if (!uploadedFile) {
        throw new ApiError(500, "File upload failed");
    }

    
    const result = await Result.create({
        title,
        batch: batchId,
        fileUrl: uploadedFile.url,
        cloudinaryId: uploadedFile.public_id,
        type: "COMMON" 
    });

    return res.status(201)
        .json(new ApiResponse(201, result, "Result saved successfully"));
});


const SaveTimeTable = asyncHandler(async (req, res) => {
    
    const { title, batchId } = req.body;

    if (!title || !batchId) {
        throw new ApiError(400, "Title and Batch ID are required");
    }

    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Timetable File is required");
    }

    const uploadedFile = await uploadOnCloudinary(localFilePath);
    if (!uploadedFile) {
        throw new ApiError(500, "File upload failed");
    }

    const timetable = await TimeTable.create({
        title,
        batch: batchId,
        fileUrl: uploadedFile.url,
        cloudinaryId: uploadedFile.public_id,
    });

    return res.status(201)
        .json(new ApiResponse(201, timetable, "Timetable saved successfully"));
});


const getTimeTable = asyncHandler(async (req, res) => {
    
   
    const { batchId } = req.params; 

    if (!batchId) {
        throw new ApiError(400, "Batch ID is required");
    }

    const timetable = await TimeTable.find({ batch: batchId }).sort({ createdAt: -1 });

    return res.status(200)
        .json(new ApiResponse(200, timetable, "Timetable fetched successfully"));
});


const getResult = asyncHandler(async (req, res) => {
    
    const studentId = req.user._id;
    const batchId = req.user.batch; 

    
    const results = await Result.find({
        $or: [
            { type: "COMMON", batch: batchId },    
            { type: "INDIVIDUAL", student: studentId } 
        ]
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, results, "Results fetched successfully")
    );
});

export { SaveResult, SaveTimeTable, getTimeTable, getResult };