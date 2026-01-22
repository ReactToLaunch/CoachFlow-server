import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Otp } from "../models/otp.model.js";
import { sendEmail, generateOtp } from "../utils/generateOtp.js";
import { UserRegisterValidationSchema, loginStudentSchema} from "../validations/userValidation.js"


const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    
    user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Failed to generate Access and Refresh Token")
  }
}






const registerUser = asyncHandler( async (req, res) => {
    
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
      selectedRole 
    } = result.data;
    
    const exixteduser = await User.findOne({
        $or: [{email}, {EnrollmentNumber}]
    })



if (exixteduser) {
    throw new ApiError(400, "User Already Exixt")
}

const user = await User.create({
    fullName,
    password,
    email,
    EnrollmentNumber,
    phone,
    selectedRole
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createdUser) {
  throw new ApiError(500, "Somthing went wrong while regestering User")
}

return res.json(
    new ApiResponse(200, {user: createdUser},  "User Registered Successfully",)

)})

const loginUser = asyncHandler( async (req, res) => {
  
  const result = loginStudentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.format()
      });
    }

    const { email, EnrollmentNumber, password } = result.data;


// checking all fields are provided
  if ([email, EnrollmentNumber, password].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "all Fields are required")
  }

// checking user is registered or not
  const user = await User.findOne({
    $or: [{email}, {EnrollmentNumber}]
  })

// if user not found
  if (!user) {
   throw new  ApiError(401, "User not registered Please Register First")
  }

// validating password
  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password")
  }

// generating access token and refresh token
  const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);

// fetching logged in user data without password and refresh token

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

   const options = {
        httpOnly: true,
        secure: true
    }

 


  // sending response
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
      const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new ApiError(404, "User with this email does not exist");
    }
    
    const generatedOtp = await generateOtp();
    
    if (!generatedOtp) {
        throw new ApiError(500, "Error Occurred While Generating OTP");
    }

    console.log("Generated OTP:", generatedOtp); 

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    
    const otpPayload = await Otp.create({
        email,
        otp: generatedOtp,
        expiresAt
        
    });

    
    const EmailSent = await sendEmail(email, generatedOtp);

    
    if (!EmailSent) {
        
        await Otp.findByIdAndDelete(otpPayload._id); 
        throw new ApiError(500, "Failed to send email. Please try again.");
    }

   
    return res.status(200).json(
        new ApiResponse(200, "Email Sent Successfully", { email }) 
    );
});



const verifyOtp = asyncHandler(async (req, res) => {
  const {email, otp} = req.body;

 

  if (!email || !otp) {
    throw new ApiError(402, "OTP is required");
  }

  const record = await Otp.findOne({ email });

  if (!record) {
    throw new ApiError(404, "OTP not found or expired");
  }


  if (record.expiresAt < Date.now()) {
    await Otp.deleteOne({_id: record._id})
    throw new ApiError(400, "Otp is Expired ")
  }

  

  const isValid = await record.validateOtp(otp);

  if (!isValid) {
    throw new ApiError(404, "Invalid OTP");
  }

  if (isValid) {
    console.log("user verified successfully")
  }

  const user = await User.findOneAndUpdate(
    { email: email },
    { 
        $set: { isVerified: true } 
    }, 
    { new: true } 
  );

  await Otp.deleteOne({ _id: record._id });

  return res.status(200).json(
    new ApiResponse(200, "Email Verified Successfully")
  );
});


const resetPassword = asyncHandler( async (req, res) => {
  
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
    await Otp.deleteOne({_id: record._id})
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


const SaveFcmToken = asyncHandler( async (req, res) => {

  const {fcmToken} = req.body;

  if (!fcmToken) {
    throw new ApiError(500, "Did not recieve FCM Token")
  }

    const token = User.findByIdAndUpdate(req.user._id, {fcmToken})

    if (!token) {
      throw new ApiError(401, "Unable to Save FCM Token")
    }

    return res.status(200)
    .json(
      new ApiResponse(200, "Token Saved SuccessFully")
    )
    
     
})






export {registerUser, verifyOtp, Otpgenerate, loginUser, resetPassword, SaveFcmToken};

