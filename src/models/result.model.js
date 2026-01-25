import mongoose, { Schema } from "mongoose";

const resultSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links to the Student User
      required: true,
    },
    batch: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    testName: {
      type: String, 
      required: true,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);


resultSchema.index({ student: 1, testDate: -1 });

const Result = mongoose.model("Result", resultSchema);
export { Result };