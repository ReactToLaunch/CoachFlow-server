import { Result } from "../models/result.model.js";
import { TimeTable } from "../models/timetable.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ==========================================
// 1. SAVE RESULT (Admin Upload)
// ==========================================
const SaveResult = asyncHandler(async (req, res) => {
    
    // 1. Validate Data FIRST (Don't upload if data is missing)
    const { title, batchId } = req.body; // Standardize to camelCase 'batchId'

    if (!title || !batchId) {
        throw new ApiError(400, "Title and Batch ID are required");
    }

    // 2. File Check
    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Result File is required");
    }

    // 3. Upload
    const uploadedFile = await uploadOnCloudinary(localFilePath);
    if (!uploadedFile) {
        throw new ApiError(500, "File upload failed");
    }

    // 4. Create Entry (Added 'type' so getResult works!)
    const result = await Result.create({
        title,
        batch: batchId,
        fileUrl: uploadedFile.url,
        cloudinaryId: uploadedFile.public_id,
        type: "COMMON" // 👈 CRITICAL FIX: Needed for your query later
    });

    return res.status(201)
        .json(new ApiResponse(201, result, "Result saved successfully"));
});

// ==========================================
// 2. SAVE TIMETABLE
// ==========================================
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

// ==========================================
// 3. GET TIMETABLE (Public/Student)
// ==========================================
const getTimeTable = asyncHandler(async (req, res) => {
    
    // Standardize to lowercase 'batchId' in params
    const { batchId } = req.params; 

    if (!batchId) {
        throw new ApiError(400, "Batch ID is required");
    }

    const timetable = await TimeTable.find({ batch: batchId }).sort({ createdAt: -1 });

    return res.status(200)
        .json(new ApiResponse(200, timetable, "Timetable fetched successfully"));
});

// ==========================================
// 4. GET RESULT (Student Dashboard)
// ==========================================
const getResult = asyncHandler(async (req, res) => {
    
    const studentId = req.user._id;
    const batchId = req.user.batch; // 👈 FIX: Matches User Model (was req.user.BatchId)

    // 🛑 TYPO FIXED: 'Reault' -> 'Result'
    const results = await Result.find({
        $or: [
            { type: "COMMON", batch: batchId },    // Matches PDF uploads
            { type: "INDIVIDUAL", student: studentId } // Matches specific marks
        ]
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, results, "Results fetched successfully")
    );
});

export { SaveResult, SaveTimeTable, getTimeTable, getResult };