import express from "express";
import ConnectDb from "./src/config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middlewares/ErrorHandler.js";



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



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(' JSON Parse Error:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload sent' });
  }
  next();
});



app.get("/", (req, res) => {
  res.send("API is Running....");
});

ConnectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on Port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("DataBase Connection Failed", error);
  });


app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", otpRouter); 
app.use("/api/v1/attendence", markAttendenceRouter);
app.use("/api/v1/students",  userRouter);
app.use("/api/v1/admin",  adminRouter);
app.use("/api/v1/batches",  batchesRouter);
app.use("/api/v1/notices",  noticesRouter);
app.use("/api/v1/results",  resultRouter);
app.use("/api/v1/fees",  feesRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use(errorHandler);

export default app;