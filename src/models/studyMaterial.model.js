import mongoose, { Schema } from "mongoose";

const studyMaterialSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true, 
        },
        description: {
            type: String,
            trim: true, 
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            uppercase: true 
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
        fileType: {
            type: String,
            enum: ["PDF", "IMAGE", "LINK"], 
            default: "PDF"
        },
        cloudinaryId: {
            type: String,
            required: true 
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User" 
        }
    },
    { timestamps: true }
);


studyMaterialSchema.index({ batch: 1, subject: 1 });

export const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);