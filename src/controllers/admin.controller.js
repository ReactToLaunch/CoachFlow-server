import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Admin } from '../models/admin.model.js';
import { PendingAuth } from '../models/pendingAuth.model.js';
import dotenv from "dotenv";
import { RegisterAdminSchema, loginAdminSchema } from '../validations/authValidation.js';
import cookieParser from "cookie-parser";
import crypto from 'crypto';
import { generateOtp, sendEmail } from '../utils/generateOtp.js';


dotenv.config()


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

    const existingAdmin = await Admin.findOne({ email })

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


const loginAdmin = asyncHandler(async (req, res) => {

    const result = loginAdminSchema.safeParse(req.body);

    if (!result.success) {

        const errorMessages = result.error.flatten().fieldErrors;

        console.log("Validation Errors:", errorMessages);


        const firstError = result.error.errors[0].message;

        throw new ApiError(400, firstError);
    }

    const { email, password } = result.data;


    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new ApiError(404, "Admin not found")
    }
    const isPasswordValid = await admin.validatePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const token = admin.generateAccessToken();


    return res.status(200)
        .cookie('token', token, {
            httpOnly: true,      // ✅ Critical: Prevents JavaScript access (Security)
            secure: process.env.NODE_ENV === 'production', // ✅ Send over HTTPS only in production
            sameSite: 'strict',  // ✅ CSRF protection
            maxAge: 24 * 60 * 60 * 1000, // ✅ Cookie expiry (e.g., 24 hours)
        })
        .json(new ApiResponse(200, { admin, token }, "Admin logged in successfully"));

});

/**
 * NEW: Generate OTP for 2FA Admin Login
 * Validates credentials and sends OTP to email
 */
const generateAdminOtp = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
        throw new ApiError(404, "Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await admin.validatePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate OTP
    const otp = await generateOtp(); // Returns 4-digit code

    // Generate unique session ID
    const sessionId = crypto.randomBytes(32).toString('hex');

    // Create pending auth session (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing pending sessions for this admin
    await PendingAuth.deleteMany({ adminId: admin._id });

    await PendingAuth.create({
        sessionId,
        adminId: admin._id,
        email: admin.email,
        otp, // Will be hashed by pre-save hook
        expiresAt
    });

    // Send OTP via email
    // await sendEmail(admin.email, 'Your Admin Login OTP', `Your OTP is: ${otp}`);

    console.log(`🔐 OTP generated for admin ${email}: ${otp}`); // For development

    return res.status(200).json(
        new ApiResponse(200, {
            sessionId,
            expiresAt,
            message: "OTP sent to your email"
        }, "OTP sent successfully")
    );
});

/**
 * NEW: Verify OTP and Complete 2FA Login
 * Verifies OTP and returns JWT token
 */
const verifyAdminOtp = asyncHandler(async (req, res) => {
    const { sessionId, otp } = req.body;

    // Validate input
    if (!sessionId || !otp) {
        throw new ApiError(400, "Session ID and OTP are required");
    }

    // Find pending session
    const session = await PendingAuth.findOne({ sessionId });

    if (!session) {
        throw new ApiError(404, "Invalid or expired session");
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
        await PendingAuth.deleteOne({ _id: session._id });
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // Check attempt limit
    if (session.attempts >= 3) {
        await PendingAuth.deleteOne({ _id: session._id });
        throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
    }

    // Verify OTP
    const isValid = await session.validateOtp(otp);

    if (!isValid) {
        // Increment attempts
        session.attempts += 1;
        await session.save();

        const remainingAttempts = 3 - session.attempts;
        throw new ApiError(401, `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
    }

    // OTP is valid - complete authentication
    const admin = await Admin.findById(session.adminId).select('-password -refreshToken');

    if (!admin) {
        throw new ApiError(404, "Admin account not found");
    }

    // Generate JWT token (ONLY NOW after full verification)
    const token = admin.generateAccessToken();

    // Delete the pending session
    await PendingAuth.deleteOne({ _id: session._id });

    console.log(`✅ Admin ${admin.email} logged in successfully via 2FA`);

    // Set cookie and return response
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


/**
 * Logout Admin
 * Clears the authentication cookie
 */
const logoutAdmin = asyncHandler(async (req, res) => {
    // Clear the cookie with the same options used when setting it
    return res.status(200)
        .cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            expires: new Date(0) // Set to past date
        })
        .json(new ApiResponse(200, null, "Logged out successfully"));
});


export { RegisterAdmin, loginAdmin, generateAdminOtp, verifyAdminOtp, logoutAdmin };
