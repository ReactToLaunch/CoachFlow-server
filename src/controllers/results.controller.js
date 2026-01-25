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




 export {SaveResult, SaveTimeTable}