import { z } from "zod";

export const CreateBatchSchema = z.object({

  name: z
    .string({ required_error: "Batch name is required" })
    .min(3, "Batch name must be at least 3 characters")
    .trim(),

  batchCode: z
    .string({ required_error: "Batch Code is required" })
    .length(10, "Batch Code must be exactly 10 characters")
    .trim()
    .toUpperCase(),

  subjects: z
    .array(
      z.string().min(1, "Subject name cannot be empty")
    )
    .min(1, "At least one subject is required"),

  year: z
    .string({ required_error: "Year is required" })
    .regex(/^[0-9]{4}$/, "Year must be a 4 digit number"),

  time: z
    .string({ required_error: "Time is required" })
    .regex(
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      "Time must be in HH:MM AM/PM format"
    )
});
