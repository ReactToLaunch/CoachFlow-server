import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const pendingAuthSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash OTP before saving
pendingAuthSchema.pre('save', async function (next) {
    if (this.isModified('otp')) {
        this.otp = await bcrypt.hash(this.otp, 10);
    }
    next();
});

// Method to validate OTP
pendingAuthSchema.methods.validateOtp = async function (otp) {
    return await bcrypt.compare(otp, this.otp);
};

export const PendingAuth = mongoose.model('PendingAuth', pendingAuthSchema);
