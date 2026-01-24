import { Batch } from "../models/batch.model.js";
import { Notice } from "../models/notice.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createNoticeSchema } from "../validations/noticeValidation.js";
import admin from "../config/firebase.js"; 

const createNotice = asyncHandler(async (req, res) => {
    
    const result = createNoticeSchema.safeParse(req.body);

    if (!result.success) {
        throw new ApiError(400, "Validation Error", result.error.format());
    }

    const { title, description, category, targetBatches, priority } = result.data; 

    if (targetBatches && targetBatches.length > 0 && !targetBatches.includes("All")) {
        const uniqueBatches = [...new Set(targetBatches)];
        const batchesExist = await Batch.find({ _id: { $in: uniqueBatches } });

        if (batchesExist.length !== uniqueBatches.length) {
            throw new ApiError(404, "One or more target batches not found");
        }
    }

    const typeMapping = {
        "Urgent": "URGENT",
        "General": "INFO",
        "Exam": "RESULT",
        "Holiday": "HOLIDAY",
        "Fee": "INFO"
    };

    const noticeData = {
        title,
        description, 
        type: typeMapping[category] || "INFO",
        targetBatches: targetBatches.includes("All") ? [] : targetBatches, 
        postedBy: req.admin?._id 
    };

    const notice = await Notice.create(noticeData);

    if (!notice) {
        throw new ApiError(500, "Failed to create notice");
    }

    sendPushNotification(notice, targetBatches);

    const populatedNotice = await Notice.findById(notice._id)
        .populate('targetBatches', 'name batchcode') 
        .populate('postedBy', 'Name email'); 

    return res.status(201)
        .json(new ApiResponse(201, { notice: populatedNotice }, "Notice created successfully"));
});

const sendPushNotification = async (notice, targetBatches) => {
    try {
        const messagePayload = {
            notification: {
                title: `📢 ${notice.title}`,
                body: notice.description.substring(0, 50) + "...",
            },
            data: {
                type: "NOTICE",
                noticeId: notice._id.toString()
            },
            android: { priority: "high" }
        };

        if (targetBatches.includes("All")) {
            await admin.messaging().sendToTopic("ALL_STUDENTS", messagePayload);
        } else {
            const batches = await Batch.find({ _id: { $in: targetBatches } });
            
            batches.forEach(async (batch) => {
                
                const topic = `BATCH_${batch.batchcode.replace(/\s+/g, '_')}`;
                await admin.messaging().sendToTopic(topic, messagePayload);
            });
        }
    } catch (error) {
        console.error("❌ Notification Failed:", error);
    }
};

export { createNotice, getAllNotices, getNoticeById };