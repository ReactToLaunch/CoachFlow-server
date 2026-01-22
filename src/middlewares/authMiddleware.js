import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js"; 

// -------------------------------------------------------------------------
// 1. PROTECT STUDENT ROUTES (The "Bouncer" for the App)
// -------------------------------------------------------------------------
export const protect = async (req, res, next) => {
  let token;

  // Check if header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token string (Remove "Bearer ")
      token = req.headers.authorization.split(" ")[1];

      // Decode the token using STUDENT SECRET
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Find the user in DB (excluding password)
      req.user = await User.findById(decoded._id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next(); // Move to the Controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// -------------------------------------------------------------------------
// 2. PROTECT ADMIN ROUTES (The "Bouncer" for the Dashboard)
// -------------------------------------------------------------------------
export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode using ADMIN SECRET (Different key!)
      const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);

      // We can either fetch from DB (Secure) or use the token payload (Fast)
      // Since you are using the DB method for Admin earlier:
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