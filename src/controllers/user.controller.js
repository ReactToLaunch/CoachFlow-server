import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Otp } from "../models/otp.model.js";
import { sendEmail, generateOtp } from "../utils/generateOtp.js";
import { UserRegisterValidationSchema, loginStudentSchema } from "../validations/userValidation.js";
import { fcmTokenSchema } from "../validations/fcmTokenValidation.js";
import { Batch } from "../models/batch.model.js";
import { Admin } from "../models/admin.model.js";
import { findAccount } from "../utils/findAccount.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Failed to generate Access and Refresh Token")
  }
}






const registerUser = asyncHandler(async (req, res) => {

  const result = UserRegisterValidationSchema.safeParse(req.body);



  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: result.error.format()
    });
  }

  const {
    fullName,
    email,
    phone,
    password,
    EnrollmentNumber,
    selectedRole,
    BatchId
  } = result.data;


  const exixteduser = await User.findOne({
    $or: [{ email }, { EnrollmentNumber }]
  })

  if (selectedRole === "admin") {
    throw new ApiError(403, "Ladle! Ayese kayse Admin banne denge")
  }

  if (exixteduser) {
    throw new ApiError(400, "User Already Exixt")
  }

  let BatchObjectId = null
  const validBatchId = await Batch.findById(BatchId)

  if (selectedRole === "student") {
    if (!BatchId) {
      throw new ApiError(401, "BatchId is required for Students")
    }


    if (!validBatchId) {
      throw new ApiError(404, "Invalid Batch Selected");
    }

    BatchObjectId = validBatchId._id;
  }

  const user = await User.create({
    fullName,
    password,
    email,
    EnrollmentNumber,
    phone,
    selectedRole,
    batch: BatchObjectId,
    selectedRole: selectedRole
  })

  // 5. Update Batch (Only for Students)
  if (selectedRole === "student" && BatchObjectId) {
    await Batch.findByIdAndUpdate(BatchObjectId, {
      $push: { students: user._id }
    });
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while regestering User")
  }

  return res.json(
    new ApiResponse(200, { user: createdUser }, "User Registered Successfully",)

  )
})

const loginUser = asyncHandler(async (req, res) => {

  const result = loginStudentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: result.error.format()
    });
  }

  const { email, EnrollmentNumber, password } = result.data;


  
  if ([email, EnrollmentNumber, password].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "all Fields are required")
  }

  
  const user = await User.findOne({
    $or: [{ email }, { EnrollmentNumber }]
  })

  
  if (!user) {
    throw new ApiError(401, "User not registered Please Register First")
  }

  
  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password")
  }

  
  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

 

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,

      },
        "User Logged In Successfully",
      ))

})


const Otpgenerate = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email field is required");
  }

  const existingEntity = await findAccount(email);

  if (!existingEntity) {
    throw new ApiError(404, "Account with this email does not exist");
  }


  const { role } = existingEntity;


  const generatedOtp = await generateOtp();

  if (!generatedOtp) {
    throw new ApiError(500, "Error Occurred While Generating OTP");
  }

  console.log(`Generated OTP for ${role} (${email}):`, generatedOtp);


  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpPayload = await Otp.create({
    email,
    otp: generatedOtp,
    expiresAt,
    role
  });


  return res
    .status(200)
    .json(new ApiResponse(200, otpPayload, `OTP sent successfully to ${role}`));
});


const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }


  const record = await Otp.findOne({ email });

  if (!record) {
    throw new ApiError(404, "OTP not found or expired");
  }

  if (record.expiresAt < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    throw new ApiError(400, "OTP has expired");
  }

  const isValid = await record.validateOtp(otp);

  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }


  const entity = await findAccount(email);

  if (!entity) {
    throw new ApiError(404, "Account associated with this email not found");
  }

  const { account, role, model } = entity;


  account.isVerified = true;

  await model.findByIdAndUpdate(
    account._id,
    {
      $set: { isVerified: true }
    },
    { new: true }
  );
  // If admin, generate authentication token for login
  if (role === 'admin') {
    const token = account.generateAccessToken();
    const adminData = await Admin.findById(account._id).select('-password -refreshToken');

    await Otp.deleteOne({ _id: record._id });

    return res.status(200)
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, {
          admin: adminData,
          token,
          isVerified: true,
          role
        }, 'Admin verified and logged in successfully')
      );
  }

  console.log(`${role} verified successfully: ${email}`);


  await Otp.deleteOne({ _id: record._id });

  return res.status(200).json(
    new ApiResponse(200, { isVerified: true, role }, `${role} verified successfully`)
  );
});

const resetPassword = asyncHandler(async (req, res) => {

  const { email, newPassword, otp } = req.body;


  if ([email, newPassword, otp].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "all Fields are required")
  }


  if (newPassword.length > 8) {
    throw new ApiError(400, "Password can only be 8 characters long")
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const record = await Otp.findOne({ email });

  if (!record) {
    throw new ApiError(404, "OTP not found or expired");
  }


  if (record.expiresAt < Date.now()) {
    await Otp.deleteOne({ _id: record._id })
    throw new ApiError(400, "Otp is Expired ")
  }

  const isValid = await record.validateOtp(otp);

  if (!isValid) {
    throw new ApiError(404, "Invalid OTP");
  }

  user.password = newPassword;

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password reset successful. Please login again."
    )
  );

});


const SaveFcmToken = asyncHandler(async (req, res) => {

  // Validate FCM token format and length
  const result = fcmTokenSchema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.errors[0].message;
    throw new ApiError(400, firstError);
  }

  const { fcmToken } = result.data;

  const token = await User.findByIdAndUpdate(
    req.user._id,
    { fcmToken },
    { new: true, select: '-password -refreshToken' }
  );

  if (!token) {
    throw new ApiError(401, "Unable to Save FCM Token");
  }

  return res.status(200)
    .json(
      new ApiResponse(200, { user: token }, "Token Saved Successfully")
    );
});



export { registerUser, verifyOtp, Otpgenerate, loginUser, resetPassword, SaveFcmToken };
