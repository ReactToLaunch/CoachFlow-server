import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";




dotenv.config()


const userSchema = new Schema(

{
   fullName: {
  type: String,
  required: true
    },

  EnrollmentNumber: {
  type: String,
  required: true,
  index: true,
  unique: true
  },

  email: {

   type: String,
   required: true,
   unique: true,
   trim: true,
   lowercase: true,
   },
   batch: {
            type: Schema.Types.ObjectId,
            ref: "Batch",
            
        },

   isVerified: {
    type: Boolean,
    default: false,
   },

  password: {

   type: String,
   required: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
            type: String, 
            default: ""
        },
  selectedRole: {
    type: String,
    required: true,
    enum: ['student', 'admin', 'teacher'],
    default: 'student'  
  },
  fcmToken: {
    type: String,
    default: null
  }
  
  
 },
 {
  timestamps: true
 }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
   this.password = await bcrypt.hash(this.password, 10);
  next();
})


userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      role: this.selectedRole,
      batch: this.batch

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


const User = mongoose.model('User', userSchema)

export { User }



