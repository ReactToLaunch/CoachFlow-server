import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';


const GetStudents = asyncHandler(async (req, res) => {
    console.log("Admin");
    
});