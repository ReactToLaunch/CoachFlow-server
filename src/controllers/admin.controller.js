import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { Admin } from '../models/admin.model.js';
import dotenv from "dotenv";
import { registerAdminSchema, loginAdminSchema } from '../validations/admin.validation.js';

dotenv.config()




const RegisterAdmin = asyncHandler( async (req, res) => {



    const result = registerAdminSchema.safeParse(req.body);

    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.format() 
      });
    }

    const { name, email, password, secretKey } = result.data;

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
    name
})

return res.status(201)
.json(new ApiResponse({admin},"Admin registered successfully", true));

});


const loginAdmin = asyncHandler( async (req, res) => {

    const result = loginAdminSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.format() 
      });
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
    .json(new ApiResponse({admin, token}, "Admin logged in successfully", true));

});

export { RegisterAdmin, loginAdmin };