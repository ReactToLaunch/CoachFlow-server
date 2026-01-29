import { Fee } from "../models/fees.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { assignFeeSchema, collectFeeSchema } from "../validations/fees.validation.js";
import { Admin } from "../models/admin.model.js";



const assignFees = asyncHandler(async (req, res) => {
    
   
    const feesStructure = assignFeeSchema.safeParse(req.body);

    if (!feesStructure.success) {
        
        throw new ApiError(400, feesStructure.error.errors[0].message);
    }

    const { studentId, batchId, totalFees, discount, nextDueDate } = feesStructure.data;

    
    const existingFee = await Fee.findOne({ 
        student: studentId, 
        batch: batchId 
    });

    if (existingFee) {
        throw new ApiError(409, "Fee structure already exists for this student in this batch");
    }

    const finalAmount = totalFees - discount;
    
    
    const pendingAmount = finalAmount; 

   
    const newFee = await Fee.create({
        student: studentId,
        batch: batchId,
        totalFees,
        discount,
        finalAmount,
        pendingAmount,
        nextDueDate,
        paidAmount: 0,
        status: pendingAmount === 0 ? "PAID" : "PENDING", 
        transactions: [] 
    });

    if (!newFee) {
        throw new ApiError(500, "Failed to assign fees");
    }

    return res.status(201).json(
        new ApiResponse(201, newFee, "Fees structure assigned successfully")
    );
});


const collectFee = asyncHandler(async (req, res) => {
    
     
    const paymentData = collectFeeSchema.safeParse(req.body);

    if (!paymentData.success) {
        throw new ApiError(400, paymentData.error.errors[0].message);
    }

    const { studentId, amount, paymentMode, transactionId, nextDueDate } = paymentData.data;

   
    const feeRecord = await Fee.findOne({ student: studentId });

    if (!feeRecord) {
        throw new ApiError(404, "Fee record not found. Please assign fees first.");
    }

    if (amount > feeRecord.pendingAmount) {
        throw new ApiError(400, `Payment rejected. Student only owes ₹${feeRecord.pendingAmount}.`);
    }

    
    const newTransaction = {
        amount,
        paymentMode,
        transactionId: transactionId || `CASH-${Date.now()}`, 
        date: new Date(),
        collectedBy: req.admin._id 
    };

    
    feeRecord.transactions.push(newTransaction);
    feeRecord.paidAmount += amount;
    feeRecord.pendingAmount = feeRecord.finalAmount - feeRecord.paidAmount;

    
    if (feeRecord.pendingAmount === 0) {
        feeRecord.status = "PAID";
    } else {
        feeRecord.status = "PARTIAL";
    }

    
    if (nextDueDate) {
        feeRecord.nextDueDate = nextDueDate;
    }

    
    await feeRecord.save();

    return res.status(200).json(
        new ApiResponse(200, feeRecord, "Payment collected successfully")
    );
});


const getDefaulters = asyncHandler(async (req, res) => {
    
    
    const { batchId } = req.query;

    const query = {
        pendingAmount: { $gt: 0 } 
    };

    if (batchId) {
        query.batch = batchId;
    }

    const defaulters = await Fee.find(query)
        .populate("student", "fullName email phone parentPhone") 
        .populate("batch", "name")
        .sort({ pendingAmount: -1 }); 

    if (!defaulters.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "Great news! No pending fees found.")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, defaulters, "Defaulters list fetched successfully")
    );
});


const getStudentLedger = asyncHandler(async (req, res) => {
    
    const { studentId } = req.params;

    
    const feeRecord = await Fee.findOne({ student: studentId })
        .populate("student", "fullName email")
        .populate("transactions.collectedBy", "name email"); 

    if (!feeRecord) {
        throw new ApiError(404, "No fee record found for this student");
    }

    return res.status(200).json(
        new ApiResponse(200, feeRecord, "Student ledger fetched successfully")
    );
});

export { assignFees, collectFee, getDefaulters, getStudentLedger };
