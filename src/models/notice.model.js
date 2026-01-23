import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, 
      required: true,
    },
    type: {
      type: String,
      enum: ["URGENT", "INFO", "RESULT", "HOLIDAY"],
      default: "INFO",
    },
    
    targetBatches: [{
      type: Schema.Types.ObjectId,
      ref: "Batch",
    }],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    }
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);

export { Notice };