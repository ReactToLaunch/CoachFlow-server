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

     if (password.length > 8) {
        throw new ApiError(400, "Password can only be 8 characters long")
     }

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

// Immediately reset isVerified for forgot password flow
user.isVerified = false;
await user.save({ validateBeforeSave: false });

return res.json(
    new ApiResponse(200, {user: createdUser},  "User Registered Successfully",)

)})
// ------------------------------------------------------------------------------------
// login user controller
const loginUser = asyncHandler( async (req, res) => {
  const {email, EnrollmentNumber, password} = req.body;

// need to check email format and Enrollment number format!!!!!!


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

  // reset the OTP/verification flag
  user.isVerified = false; 
  await user.save({ validateBeforeSave: false });


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
// ---------------------------------------------------------------------

// creating forgot password controller

// User clicks on forgot password 
// user sent to another page
// user enters email

const forgot_password = asyncHandler( async (req, res) => {

  console.log("REQ HEADERS FULL:", req.headers);

  console.log("REQ HEADERS:", req.headers["content-type"]);
  console.log("REQ BODY:", req.body);

  const { email } = req.body || {};

    // ***E:  check if email field is provided***

    if (email?.trim() === "") 
    {throw new ApiError(401, "all Fields are required")}

    // ***E: check if email is correct format***

    if (!email || typeof email !== "string") {
      throw new ApiError(400, "Email must be a string");
    }



    let atCount = 0;
    for (let char of email){
      if (char === "@") {
        atCount++;
        if (atCount > 1){
          throw new ApiError(400, "multiple @ characters found in email")
        }
      }
      
    }
    if (atCount === 0) {
      throw new ApiError(400, "invalid email format, missing @ character")
    }

  // ***E: check if email exists***
  const userExists = await User.exists({ email });
  
  if (!userExists) {
    throw new ApiError(404, "No user found with this email");
  }


  return res.status(200).json(
    new ApiResponse(
      200,
      { email },
      "Email verified. Proceed to OTP"
    )
  );
})

// user clicks on send otp
// do otp verification
// if otp verified


// now the user can reset password
// send user to another window 

const reset_password = asyncHandler( async (req, res) => {
  // get the new password from req.body
  const { email, newPassword } = req.body;

// E: check if email and new password fields are provided
  if ([email, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "all Fields are required")
  }
// E: check if new password is 8 characters long

  if (newPassword.length > 8) {
    throw new ApiError(400, "Password can only be 8 characters long")
 }
// find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔑 THIS IS ALL YOU DO
  user.password = newPassword;
// hash new password
// update password in db
  await user.save();


  //  changing isVerified to false for security reasons
  user.isVerified = false;
  await user.save({ validateBeforeSave: false });
    
  // send response
  return res.status(200).json(
    new ApiResponse(
      200,
      "Password reset successful. Please login again."
    )
  );
// send user back to login page


// allow user to reset password
});






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
 




export {registerUser, verifyOtp, Otpgenerate, loginUser, getAllStudents, forgot_password,reset_password};

