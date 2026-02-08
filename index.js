import express from "express";
import ConnectDb from "./src/config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Security Imports
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import { sanitizeInput } from "./src/middlewares/sanitizer.js";

// Routes
import userRouter from './src/routes/user.route.js';
import otpRouter from "./src/routes/verifyUser.route.js";
import markAttendenceRouter from "./src/routes/markAttendence.route.js";
import adminRouter from "./src/routes/admin.route.js";
import batchesRouter from "./src/routes/batches.route.js";
import noticesRouter from "./src/routes/notices.route.js";
import resultRouter from "./src/routes/result.route.js";
import feesRouter from "./src/routes/fees.route.js";
import dashboardRouter from "./src/routes/dashboard.route.js";

dotenv.config({
  path: './.env'
});

const app = express();

// ==========================================
// 1. SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// ✅ CORS Configuration (Only define this ONCE)
const corsOptions = {
  // Make sure your .env has CORS_ORIGIN=http://localhost:3000
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Content-Type-Options'
  ],
};

app.use(cors(corsOptions));

// Rate Limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increased slightly for testing
  message: "Too many authentication attempts, please try again later"
});

// Admin 2FA Rate Limiter (stricter)
const admin2FALimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 OTP generation attempts per 15 minutes
  message: "Too many OTP requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Data Sanitization
app.use(mongoSanitize());
app.use(sanitizeInput);
app.use(hpp());

// ==========================================
// 2. STANDARD MIDDLEWARE
// ==========================================
// Only need to declare these ONCE
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Error Handling for Bad JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Parse Error:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload sent' });
  }
  next();
});

// ❌ DELETED: app.use(cors());  <-- This was breaking your app!

app.get("/", (req, res) => {
  res.send("API is Running....");
});

// ==========================================
// 3. DATABASE & SERVER
// ==========================================
ConnectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on Port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("DataBase Connection Failed", error);
  });

// ==========================================
// 4. ROUTES
// ==========================================
// Note: Put 'limiter' BEFORE the 'router' to actually protect the route
app.use("/api/v1/users", authLimiter, userRouter);
app.use("/api/v1/users", authLimiter, otpRouter); // Check if this path shouldn't be unique
app.use("/api/v1/attendence", limiter, markAttendenceRouter);
app.use("/api/v1/students", limiter, userRouter);
app.use("/api/v1/admin", authLimiter, adminRouter);
app.use("/api/v1/batches", limiter, batchesRouter);
app.use("/api/v1/notices", limiter, noticesRouter);
app.use("/api/v1/results", limiter, resultRouter);
app.use("/api/v1/fees", limiter, feesRouter);
app.use("/api/v1/dashboard", limiter, dashboardRouter);

export default app;