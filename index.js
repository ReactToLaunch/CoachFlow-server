import express from "express"
import ConnectDb from "./src/config/db.js"
import dotenv from "dotenv";
import cors from "cors";




dotenv.config({
   path: './.env'
})


const app = express()

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
.then( () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is Running on Port:${process.env.PORT}`);        
    })
})
.catch( (error) => {
 console.log("DataBase Connection Failed", error)
})


// import routes here
import userRouter from './src/routes/user.route.js';
import otpRouter from "./src/routes/verifyUser.route.js";
import markAttendenceRouter from "./src/routes/markAttendence.route.js";
import adminRouter from "./src/routes/admin.route.js";
import batchesRouter from "./src/routes/batches.route.js";




// routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", otpRouter);
app.use("/api/v1/attendence", markAttendenceRouter);
app.use("/api/v1/students", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/batches", batchesRouter);
