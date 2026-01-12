import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Otp } from "../models/otp.model.js";
import { sendEmail, generateOtp } from "../utils/generateOtp.js";


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
    const {fullName, email, phone, password, EnrollmentNumber, selectedRole} = req.body;
    
    

    if ([fullName, email, phone, password, EnrollmentNumber, selectedRole].some((field) => field?.trim() === "")) {
       throw new ApiError(400, "All Fields are Required") 
    }

  //  const allowedDomain = 'students.vnit.ac.in'

  //  const emailDomain = email.split("@")[1];

  //  if(emailDomain !== allowedDomain) {

  // throw new ApiError(401, "Only Vnit Students email Address is Allowed")
  //  }


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
    new ApiResponse(200, "User Registered Successfully")
)
})


const loginUser = asyncHandler( async (req, res) => {
  const {email, EnrollmentNumber, password} = req.body;

  if ([email, EnrollmentNumber, password].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "all Fields are required")
  }

  const user = await User.findOne({
    $or: [{email}, {EnrollmentNumber}]
  })
  
  if (!user) {
   throw new  ApiError(401, "User not registered Please Register First")
  }
  
  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password")
  }

  const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);
  console.log(accessToken);
  

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
  new ApiResponse(200, "User Logged In Successfully", {
    user: loggedInUser,
    accessToken,
    refreshToken
  }
))

})


const Otpgenerate = asyncHandler(async (req, res) => {
    
    const { email } = req.body;

    
    if (!email) {
        throw new ApiError(400, "Email field is required");
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

const getAllStudents = asyncHandler( async (req, res) => {
  const users = await User.find({selectedRole: "student"}).select("_id fullName EnrollmentNumber email phone");

   if (!users) {
    throw new ApiError(500, "Somthing went wrong while fetching students")
   }
     return res.status(200).json({
      success: true,
      data: users
    });
  
});
 




export {registerUser, verifyOtp, Otpgenerate, loginUser, getAllStudents};