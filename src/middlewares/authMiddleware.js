import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js"; 


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
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next(); 
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
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
        return res.status(401).json({ message: "Not authorized, admin not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, admin token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no admin token" });
  }
};