import { z } from 'zod';


export const RegisterAdminSchema = z.object({

    name: z
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