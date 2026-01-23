import { z } from 'zod';


export const RegisterAdminSchema = z.object({

    Name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name should be at least 3 characters long")
    .trim(),

    email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

    password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password should be at least 6 characters long")
    .max(8, "Password should be at most 8 characters long")
    .trim(),

    secretKey: z.string().min(1, { message: "Secret Key is required" })

})

export const loginAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password cannot be empty" })
});



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