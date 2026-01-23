import mongoose, { Schema } from "mongoose";

const batchSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true, 
    },
    batchcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, 
    },
    subjects: [{
      type: String,
      required: true, 
    }],
    year: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);

export { Batch };