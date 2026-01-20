import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true 
    },
    batch: {
      type: Schema.Types.ObjectId, 
      ref: "Batch", 
      required: true,
      index: true
    },
    
    absentStudents: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    totalStudents: {
      type: Number, 
      required: true
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    }
  },
  { timestamps: true }
);


attendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export { Attendance };

