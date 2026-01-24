import { Notice } from "../models/notice.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createNoticeSchema } from "../validations/noticeValidation.js";
import admin from "../config/firebase.js";


const createNotice = asyncHandler(async (req, res) => {
    const notice = createNoticeSchema.safeParse(req.body)

    if (!notice.success) {
        throw new ApiError(400, "Invalid notice data")
    }

    const { title, content, type, targetBatches, priority, attachmentUrl } = notice.data;

    const finalBatch = targetBatches === "All" ? ["All"] : targetBatches;


    const createdNotice = await Notice.create({
        title,
        content,
        type,
        targetBatches: finalBatch,
        priority,
        attachmentUrl,
        postedBy: req.admin?._id
    })

    return res.status(201).json(new ApiResponse(201, createdNotice, "Notice created successfully"))
})




// Get all notices for a specific batch (student access)
const getAllNotices = asyncHandler(async (req, res) => {
    // Get the authenticated user's ID from the protect middleware
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Import StudentProfile model
    const { StudentProfile } = await import("../models/studentProfile.js");

    // Find the student's profile to get their batch
    const studentProfile = await StudentProfile.findOne({ user: userId }).select("batch");

    if (!studentProfile) {
        throw new ApiError(404, "Student profile not found");
    }

    const studentBatchId = studentProfile.batch;

    // Query notices where targetBatches contains the student's batch ID or "All"
    // Note: Since the model expects ObjectId array, we need to handle "All" as a special case
    const notices = await Notice.find({
        $or: [
            { targetBatches: studentBatchId },
            { targetBatches: "All" }
        ]
    })
        .populate("postedBy", "fullName email")
        .populate("targetBatches", "Name batchcode")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(200, notices, "Notices retrieved successfully")
    );
});

// Get a specific notice by ID (student access)
const getNoticeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Import StudentProfile model
    const { StudentProfile } = await import("../models/studentProfile.js");

    // Find the student's profile to get their batch
    const studentProfile = await StudentProfile.findOne({ user: userId }).select("batch");

    if (!studentProfile) {
        throw new ApiError(404, "Student profile not found");
    }

    const studentBatchId = studentProfile.batch;

    // Find the notice
    const notice = await Notice.findById(id)
        .populate("postedBy", "fullName email")
        .populate("targetBatches", "Name batchcode")
        .lean();

    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    // Check if the student has access to this notice
    const hasAccess = notice.targetBatches.some(
        batch => batch._id.toString() === studentBatchId.toString() || batch === "All"
    );

    if (!hasAccess) {
        throw new ApiError(403, "You don't have access to this notice");
    }

    return res.status(200).json(
        new ApiResponse(200, notice, "Notice retrieved successfully")
    );
});


export { createNotice, getAllNotices, getNoticeById };