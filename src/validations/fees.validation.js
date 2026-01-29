import { z } from "zod";


const assignFeeSchema = z.object({
    studentId: z.string({ required_error: "Student ID is required" }).trim().min(1),
    batchId: z.string({ required_error: "Batch ID is required" }).trim().min(1),
    
    totalFees: z
        .number({ invalid_type_error: "Fee must be a number" })
        .min(0, "Total Fees cannot be negative"),
    
    discount: z
        .number()
        .min(0, "Discount cannot be negative")
        .default(0),
    
    nextDueDate: z.coerce.date({ required_error: "Due Date is required" }) 
}).refine((data) => data.discount <= data.totalFees, {
    
   message: "Discount cannot be greater than Total Fees",
    path: ["discount"], 
});


const collectFeeSchema = z.object({
    studentId: z.string().trim().min(1, "Student ID is required"),
    
    amount: z
        .number({ invalid_type_error: "Amount must be a number" })
        .positive("Payment amount must be greater than 0"), 
        
    paymentMode: z.enum(["CASH", "ONLINE", "UPI", "CHEQUE"], {
        errorMap: () => ({ message: "Invalid Payment Mode. Choose CASH, UPI, ONLINE, or CHEQUE" })
    }),
    
    transactionId: z.string().trim().optional(),
    
    nextDueDate: z.coerce.date().optional() 
});

export { assignFeeSchema, collectFeeSchema };