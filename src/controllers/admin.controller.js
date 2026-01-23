import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { Admin } from '../models/admin.model.js';
import dotenv from "dotenv";
import { RegisterAdminSchema, loginAdminSchema, createBatchSchema } from '../validations/authValidation.js';
import { Notice } from "../models/notice.js";
import { Batch } from '../models/batch.model.js';

dotenv.config()




const RegisterAdmin = asyncHandler( async (req, res) => {



    const result = RegisterAdminSchema.safeParse(req.body);

    
    if (!result.success) {
     throw new ApiError(400, "Validation Error", result.error.format());
    }

    const { Name, email, password, secretKey } = result.data;

 if (secretKey !== process.env.ADMIN_SECRET) {
  throw new ApiError(404, "Secret key is not corrrect")
    
 }
  
const existingAdmin = await Admin.findOne({email})

if (existingAdmin) {
    throw new ApiError(401, "Admin already exists") 
}

const admin = await Admin.create({
    email,
   password,
    Name
})

const createdAdmin = await Admin.findById(admin._id).select(" -password -refreshToken");

if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering admin")
}

return res.status(200)
.json(new ApiResponse(200, {admin: createdAdmin}, "Admin registered successfully"));

});


const loginAdmin = asyncHandler( async (req, res) => {

    const result = loginAdminSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "Validation Error", result.error.format());
    }

    const { email, password } = result.data;
    

    const admin = await Admin.findOne({email})

    if (!admin) {
        throw new ApiError(404, "Admin not found") 
    }
    const isPasswordValid = await admin.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials") 
    }

    const token = admin.generateAccessToken();
  
    return res.status(200)
    .json(new ApiResponse(200, {admin, token}, "Admin logged in successfully"));

});


   const CreateBatch = asyncHandler( async (req, res) => {
     
    const result = createBatchSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "Validation Error", result.error.format());
    }

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

     return res.status(201)
     .json(new ApiResponse({batch}, "Batch created successfully", true));

   })



const getAllBatches = asyncHandler( async (req, res) => {

    const batches = await Batch.find();

    return res.status(200)
    .json(new ApiResponse({batches}, "Batches fetched successfully", true));

});





export { RegisterAdmin, loginAdmin, CreateBatch, getAllBatches };