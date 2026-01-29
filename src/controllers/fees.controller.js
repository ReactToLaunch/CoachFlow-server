import { Fee } from "../models/fees.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { assignFeeSchema, collectFeeSchema } from "../validations/fees.validation.js";



const assignFees = asyncHandler( (req, res) => {

  const fees = assignFeeSchema.safeParse(req.body);

  if(!fees.success){
 
     throw new ApiError(400, "Fees Validation failed")

  }

  

})



















export { assignFees }