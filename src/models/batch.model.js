import mongoose, { Schema } from "mongoose";

const batchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "JEE Class 12 - Alpha"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // e.g., "JEE-12A"
    },
    subjects: [{
      type: String, // e.g., "Physics", "Maths"
    }],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);

export { Batch };