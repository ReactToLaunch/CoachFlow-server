import { Notice } from "../models/notice.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createNoticeSchema } from "../validations/noticeValidation.js";


const createNotice = asyncHandler(async (req, res) => {
  
    const notice = createNoticeSchema.safeParse(req.body);

    if (!notice.success) {
        throw new ApiError(400, "Invalid notice data", notice.error.format());
    }

    const { title, content, type, targetBatches, priority, attachmentUrl } = notice.data;

   
    const dbBatches = targetBatches.includes("All") ? [] : targetBatches;

    
    const createdNotice = await Notice.create({
        title,
        content,
        type,
        targetBatches: dbBatches, 
        priority,
        attachmentUrl,
        postedBy: req.admin?._id
    });

   

    return res.status(201).json(new ApiResponse(201, createdNotice, "Notice created successfully"));
});




const getAllNotices = asyncHandler(async (req, res) => {
    
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    
    const { StudentProfile } = await import("../models/studentProfile.js");

    
    const studentProfile = await StudentProfile.findOne({ user: userId }).select("batch");

    if (!studentProfile) {
        throw new ApiError(404, "Student profile not found");
    }

    const studentBatchId = studentProfile.batch;

   
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


const getNoticeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    
    const { StudentProfile } = await import("../models/studentProfile.js");

    
    const studentProfile = await StudentProfile.findOne({ user: userId }).select("batch");

    if (!studentProfile) {
        throw new ApiError(404, "Student profile not found");
    }

    const studentBatchId = studentProfile.batch;

    
    const notice = await Notice.findById(id)
        .populate("postedBy", "fullName email")
        .populate("targetBatches", "Name batchcode")
        .lean();

    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    
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