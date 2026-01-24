import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z
    .string({ required_error: "Notice Title is required" })
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long (max 100 chars)")
    .trim(),

  content: z
    .string({ required_error: "Notice Description is required" })
    .min(10, "Description is too short, please provide details")
    .trim(),

  type: z.enum(["URGENT", "INFO", "RESULT", "HOLIDAY"], {
    errorMap: () => ({ message: "Type must be one of: URGENT, INFO, RESULT, HOLIDAY" })
  }),

  targetBatches: z
    .array(z.string())
    .min(1, "Select at least one batch or choose 'All'")
    .default(["All"]),


  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),


  attachmentUrl: z.string().url().optional().or(z.literal("")),
});