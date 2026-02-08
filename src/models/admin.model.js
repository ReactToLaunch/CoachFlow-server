import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      default: "Super Admin",
    },
    isVerified: {
    type: Boolean,
    default: false,
   },
  },
  { timestamps: true }
);


adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


adminSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: "superadmin" },
    process.env.ADMIN_ACCESS_TOKEN_SECRET, 
    { expiresIn: "1d" } 
  );
};

const Admin = mongoose.model("Admin", adminSchema);
export { Admin };