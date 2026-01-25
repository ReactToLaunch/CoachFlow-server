import { Reault } from "../models/result.model";
import { TimeTable } from "../models/timetable.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";





// saving Result File to Cloudinary
const SaveResult = asyncHandler(async (req, res) => {
    
const localFilePath = req.file?.path;

 if (!localFilePath) {
    throw new ApiError(400, "File is required");
 }

 const uploadedFile = await uploadOnCloudinary(localFilePath);

if (!uploadedFile) {
    throw new ApiError(400, "File upload failed");
}

const { title, BatchId } = req.body;


const result = await Reault.create({
title,
batch: BatchId,
fileUrl: uploadedFile.url,
cloudinaryId: uploadedFile.public_id,
})  

return res.status(201)
.json(new ApiResponse(201, {result}, "Result saved successfully"));

 })


 // saving Timetable File to Cloudinary
const SaveTimeTable = asyncHandler(async (req, res) => {
    
const localFilePath = req.file?.path;

 if (!localFilePath) {
    throw new ApiError(400, "File is required");
 }

 const uploadedFile = await uploadOnCloudinary(localFilePath);

if (!uploadedFile) {
    throw new ApiError(400, "File upload failed");
}

const { title, BatchId } = req.body;


const timetable = await TimeTable.create({
title,
batch: BatchId,
fileUrl: uploadedFile.url,
cloudinaryId: uploadedFile.public_id,
})  

return res.status(201)
.json(new ApiResponse(201, {timetable}, "TimeTable saved successfully"));

 })

const getTimeTable = asyncHandler(async (req, res) => {
    
 const { BatchId } = req.params;

 const timetable = await TimeTable.find({batch: BatchId}).sort({createdAt: -1})

 return res.status(200)
.json(new ApiResponse(200, {timetable}, "TimeTable fetched successfully"));

}) 


const getResult = asyncHandler( async (req, res) => {
    const studentId = req.user._id;
    const batchId = req.user.BatchId;

    const result = await Reault.find({
        $or: [
            { type: "COMMON", batch: batchId }, 
            { type: "INDIVIDUAL", student: studentId } 
        ]
    }).sort({ createdAt: -1 });

   if (!result) {
throw new ApiError(404, "Error while finding Result File")
   }
   return res.status(200)
   .json(
    new ApiResponse(200, result, "Results fetched successfully")
   )
})


 export {SaveResult, SaveTimeTable, getTimeTable, getResult}