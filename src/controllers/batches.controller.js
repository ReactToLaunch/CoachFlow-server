import { Batch } from "../models/batch.model.js"; 
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { createBatchSchema } from "../validations/batchValidation.js";




const CreateBatch = asyncHandler( async (req, res) => {
 
  const result = createBatchSchema.safeParse(req.body);

    if (!result.success) {
        throw new ApiError(400, "Validation Error", result.error.format());
    }

    const { Name, batchcode, subjects, year, time } = result.data;
        const existingBatch = await Batch.findOne({batchcode})

        if (existingBatch) {
           throw new ApiError(409, "Batch with this code already exists")
        }

        const batch = await Batch.create({
           Name,
           batchcode,
              subjects,
              year,
                time
        })

        return res.status(200)
        .json(new ApiResponse(200, {batch}, "Batch created successfully")); 
})  

const getAllBatches = asyncHandler( async (req, res) => {
    const batches = await Batch.find();

    if (!batches) {
        throw new ApiError(404, "No batches found");
    }

    return res.status(200)
    .json(new ApiResponse(200, {batches}, "Batches fetched successfully")); 
})

const getBatchById = asyncHandler( async (req, res) => {
    const {id} = req.params;
    const batch = await Batch.findById(id);

    if (!batch) {
        throw new ApiError(404, "Batch not found");
    }
    return res.status(200)
    .json(new ApiResponse(200, {batch}, "Batch fetched successfully")); 
})

const updateBatch = asyncHandler( async (req, res) => {
    const {id} = req.params;
    const updates = createBatchSchema.safeParse(req.body);

    if (!updates.success) {
        throw new ApiError(400, "Validation Error", updates.error.format());
    }
   
     const batch = await Batch.findById(id);
        if (!batch) {
            throw new ApiError(404, "Batch not found");
        }

        if (updates.batchcode && updates.batchcode !== batch.code) {
        const existing = await Batch.findOne({ code: updates.batchcode });
        if (existing) {
            throw new ApiError(409, "Batch with this code already exists");
        }
     
         const updatedBatch = await Batch.findByIdAndUpdate(id, updates, {
      new: true, 
      runValidators: true 
    });

    return res.status(200)
    .json(new ApiResponse(200, {updatedBatch}, "Batch updated successfully"));
    }
    
})





export {CreateBatch, getAllBatches, getBatchById, updateBatch};