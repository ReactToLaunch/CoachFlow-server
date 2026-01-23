import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true 
  },

  
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  
  admissionNumber: {
    type: String,
    required: true,
    unique: true, 
    uppercase: true
  },
  
  rollNumber: {
    type: String, 
  },

  
  parentsName: {
    type: String,
    required: true
  },
  parentsPhone: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  }

}, { timestamps: true });

 const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

    export  {   StudentProfile };