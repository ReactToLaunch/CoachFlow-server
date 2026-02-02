import express from "express"
import ConnectDb from "./src/config/db.js"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Security Imports
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp"
import cors from "cors";
import { sanitizeInput } from "./src/middlewares/sanitizer.js";

 





dotenv.config({
  path: './.env'
})


const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000", 
    credentials: true, 
    optionsSuccessStatus: 200
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

// D. Data Sanitization (NoSQL Injection)
// Converts user input like { "$gt": "" } to simple strings
app.use(mongoSanitize());

app.use(sanitizeInput);   

// F. Prevent Parameter Pollution
// Cleans up duplicate query parameters
app.use(hpp());

// ==========================================
// 2. STANDARD MIDDLEWARE
// ==========================================
app.use(express.json({ limit: "16kb" })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(express.json());
app.use((err, req, res, next) => {

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Parse Error:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload sent' });
  }
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is Running....")
})




ConnectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is Running on Port:${process.env.PORT}`);
    })
  })
  .catch((error) => {
    console.log("DataBase Connection Failed", error)
  })


// import routes here
import userRouter from './src/routes/user.route.js';
import otpRouter from "./src/routes/verifyUser.route.js";
import markAttendenceRouter from "./src/routes/markAttendence.route.js";
import adminRouter from "./src/routes/admin.route.js";
import batchesRouter from "./src/routes/batches.route.js";
import noticesRouter from "./src/routes/notices.route.js";
import resultRouter from "./src/routes/result.route.js";
import feesRouter from "./src/routes/fees.route.js";




// routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", otpRouter);
app.use("/api/v1/attendence", markAttendenceRouter);
app.use("/api/v1/students", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/batches", batchesRouter);
app.use("/api/v1/notices", noticesRouter);
app.use("/api/v1/results", resultRouter);
app.use("/api/v1/fees", feesRouter);

// Export app for testing
export default app;
