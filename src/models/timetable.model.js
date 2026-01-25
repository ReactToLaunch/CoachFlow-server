import mongoose, { Schema } from "mongoose";

const timeTableSchema = new Schema(
    {
        title: {
            type: String,
            required: true, 
            trim: true
        },
        batch: {
            type: Schema.Types.ObjectId,
            ref: "Batch", 
            required: true 
        },
        fileUrl: {
            type: String,
            required: true, 
        },
        cloudinaryId: {
            type: String,
            required: true 
        }
    },
    { timestamps: true }
);

export const TimeTable = mongoose.model("TimeTable", timeTableSchema);