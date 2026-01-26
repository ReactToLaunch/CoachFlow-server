import { z } from "zod"

export const UserRegisterValidationSchema = z.object({

  fullName: z
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

    phone: z
    .string()
    .length(10, {message: "Phone Number Must be 10 digit"})
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers" }),

    EnrollmentNumber: z
    .string({ required_error: "Enrollment Number is required" })
    .min(1, { message: "Enrollment Number cannot be empty" })
    .trim()
    .toUpperCase(), 
  selectedRole: z
    .enum(["student", "teacher"], { 
      errorMap: () => ({ message: "Role must be 'student' or 'teacher'" }) 
    })
    .default("student"),
  BatchId: z.string().optional()
}) 

export const loginStudentSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .optional()
    .or(z.literal("")), 

  EnrollmentNumber: z
    .string()
    .toUpperCase() 
    .optional()
    .or(z.literal("")), 
  password: z
    .string()
    .min(1, { message: "Password is required" })

}).refine((data) => data.email || data.EnrollmentNumber, {
  
  message: "Please provide either Email or Enrollment Number",
  path: ["email"], 
});