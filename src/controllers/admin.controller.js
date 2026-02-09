import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Admin } from '../models/admin.model.js';
import { PendingAuth } from '../models/pendingAuth.model.js';
import dotenv from "dotenv";
import { RegisterAdminSchema, loginAdminSchema } from '../validations/authValidation.js';
import crypto from 'crypto';
import { generateOtp, sendEmail } from '../utils/generateOtp.js';


dotenv.config()

// Admin registration and only be done by Us to register Admin and then give them Login credentials

const RegisterAdmin = asyncHandler(async (req, res) => {



    const result = RegisterAdminSchema.safeParse(req.body);

    if (!result.success) {

        const errorMessages = result.error.flatten().fieldErrors;

        console.log("Validation Errors:", errorMessages);


        const firstError = result.error.errors[0].message;

        throw new ApiError(400, firstError);
    }


    const { Name, email, password, secretKey } = result.data;

    if (secretKey !== process.env.ADMIN_SECRET) {
        throw new ApiError(404, "Secret key is not corrrect")

    }

    const existingAdmin = await Admin.findOne({ email });

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
        .json(new ApiResponse(200, { admin: createdAdmin }, "Admin registered successfully"));

});


// logining in the Admin and this is used in Website

const loginAdmin = asyncHandler(async (req, res) => {

    const result = loginAdminSchema.safeParse(req.body);

    if (!result.success) {

        const errorMessages = result.error.flatten().fieldErrors;

        console.log("Validation Errors:", errorMessages);

        const firstError = result.error.errors[0].message;

        throw new ApiError(400, firstError);
    }

    const { email, password } = result.data;


    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new ApiError(404, "Admin not found")
    }

    const isPasswordValid = await admin.validatePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const token = await admin.generateAccessToken();


    return res.status(200)
        .cookie('token', token, {
            httpOnly: true,      
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',  
            maxAge: 24 * 60 * 60 * 1000, 
        })
        .json(new ApiResponse(200, { admin, token }, "Admin logged in successfully"));

});


// different otp controller for Admin
const generateAdminOtp = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

   
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
        throw new ApiError(404, "Invalid credentials");
    }

    
    const isPasswordValid = await admin.validatePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    
    const otp = await generateOtp(); 

    
    const sessionId = crypto.randomBytes(32).toString('hex');

    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    
    await PendingAuth.deleteMany({ adminId: admin._id });

    await PendingAuth.create({
        sessionId,
        adminId: admin._id,
        email: admin.email,
        otp, 
        expiresAt
    });

   
    // just for the dev, and has to be removed when deploying
    console.log(`OTP generated for admin ${email}: ${otp}`); 

    return res.status(200).json(
        new ApiResponse(200, {
            sessionId,
            expiresAt,
            message: "OTP sent to your email"
        }, "OTP sent successfully")
    );
});


// verifying Admin for admin website

const verifyAdminOtp = asyncHandler(async (req, res) => {
    const { sessionId, otp } = req.body;

    
    if (!sessionId || !otp) {
        throw new ApiError(400, "Session ID and OTP are required");
    }

    
    const session = await PendingAuth.findOne({ sessionId });

    if (!session) {
        throw new ApiError(404, "Invalid or expired session");
    }

    
    if (session.expiresAt < Date.now()) {
        await PendingAuth.deleteOne({ _id: session._id });
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    
    if (session.attempts >= 3) {
        await PendingAuth.deleteOne({ _id: session._id });
        throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
    }

    
    const isValid = await session.validateOtp(otp);

    if (!isValid) {
       
        session.attempts += 1;
        await session.save();

        const remainingAttempts = 3 - session.attempts;
        throw new ApiError(401, `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
    }

    
    const admin = await Admin.findById(session.adminId).select('-password -refreshToken');

    if (!admin) {
        throw new ApiError(404, "Admin account not found");
    }

    
    const token = admin.generateAccessToken();

    
    await PendingAuth.deleteOne({ _id: session._id });

    console.log(`✅ Admin ${admin.email} logged in successfully via 2FA`);

    
    return res.status(200)
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(200, { admin, token }, "Admin logged in successfully")
        );
});


// logout controller.
const logoutAdmin = asyncHandler(async (req, res) => {
    
    return res.status(200)
        .cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, 
            expires: new Date(0) 
        })
        .json(new ApiResponse(200, null, "Logged out successfully"));
});


export { RegisterAdmin, loginAdmin, generateAdminOtp, verifyAdminOtp, logoutAdmin };
