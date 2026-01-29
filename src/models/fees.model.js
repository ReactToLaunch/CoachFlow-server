import mongoose, { Schema } from "mongoose";


const transactionSchema = new Schema({
    amount: { 
        type: Number, 
        required: true,
        min: [1, "Amount must be greater than 0"] 
    },
    paymentMode: {
        type: String,
        enum: ["CASH", "ONLINE", "UPI", "CHEQUE"],
        required: true
    },
    transactionId: {
        type: String, 
        trim: true,
        default: "" 
    },
    date: {
        type: Date,
        default: Date.now
    },
    collectedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin" 
    }
});


const feeSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        batch: {
            type: Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        
        totalFees: {
            type: Number,
            required: true,
            min: [0, "Fees cannot be negative"]
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"]
        },
        finalAmount: {
            type: Number,
            required: true
        },
        
        
        paidAmount: {
            type: Number,
            default: 0,
            min: [0, "Paid amount cannot be negative"]
        },
        pendingAmount: {
            type: Number,
            default: 0
        },
        nextDueDate: {
            type: Date, 
            required: true
        },
        status: {
            type: String,
            enum: ["PAID", "PARTIAL", "PENDING", "OVERDUE"],
            default: "PENDING"
        },
        
        
        transactions: [transactionSchema]
    },
    { timestamps: true }
);


feeSchema.pre("save", function (next) {
    // 1. Calculate Final Total
    this.finalAmount = this.totalFees - this.discount;

    // 2. Calculate Pending
    this.pendingAmount = this.finalAmount - this.paidAmount;

    // 3. Update Status
    if (this.pendingAmount <= 0) {
        this.status = "PAID";
        this.pendingAmount = 0; // Safety clamp
    } else if (this.paidAmount > 0) {
        this.status = "PARTIAL";
    } else {
        this.status = "PENDING";
    }

    // 4. Check Overdue (If pending > 0 AND date passed)
    if (this.pendingAmount > 0 && new Date() > this.nextDueDate) {
        this.status = "OVERDUE";
    }

    next();
});

export const Fee = mongoose.model("Fee", feeSchema);