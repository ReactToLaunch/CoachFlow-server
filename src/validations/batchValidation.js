import { z } from "zod";


export const createBatchSchema = z.object({
  Name: z
    .string({ required_error: "Batch Name is required" })
    .min(3, { message: "Batch Name must be at least 3 characters" })
    .trim(),

  batchcode: z
    .string({ required_error: "Batch Code is required" })
    .min(2, { message: "Batch Code is too short" })
    .trim()
    .toUpperCase() 
    .regex(/^[A-Z0-9-]+$/, { message: "Batch Code can only contain letters, numbers, and dashes" }),

  
  subjects: z
    .array(z.string().min(1))
    .min(1, { message: "Please select at least one subject" }),

  year: z
    .string() 
    .min(4, { message: "Year must be valid (e.g. 2026)" }),

  time: z
    .string()
    .min(1, { message: "Time schedule is required (e.g. 4 PM - 8 PM)" })
});