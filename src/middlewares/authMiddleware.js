import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js"; 
import { th } from "zod/locales";


export const protect = async (req, res, next) => {
  let token;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      
      token = req.headers.authorization.split(" ")[1];

      
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      
      req.user = await User.findById(decoded._id).select("-password");

      if (!req.user) {
        throw new Error("Not authorized, user not found");
      }

      next(); 
    } catch (error) {
      console.error(error);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    throw new Error("Not authorized, no token");
  }
};


export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      
      const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);

      
      req.admin = await Admin.findById(decoded._id).select("-password");

      if (!req.admin) {
        throw new Error("Not authorized, admin not found");
      }

      next();
    } catch (error) {
      console.error(error);
      throw new Error("Not authorized, admin token failed");
    }
  }

  if (!token) {
    throw new Error("Not authorized, no admin token");
  }
 console.log("Admin verified !");
 

};


