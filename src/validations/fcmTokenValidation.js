import { z } from 'zod';

/**
 * FCM Token Validation Schema
 * 
 * Firebase Cloud Messaging tokens are typically 152-163 characters long
 * and consist of alphanumeric characters, hyphens, and underscores.
 */
export const fcmTokenSchema = z.object({
    fcmToken: z
        .string({ required_error: "FCM token is required" })
        .min(100, "Invalid FCM token - token too short")
        .max(200, "Invalid FCM token - token too long")
        .regex(
            /^[A-Za-z0-9_-]+$/,
            "Invalid FCM token format - only alphanumeric characters, hyphens, and underscores allowed"
        )
        .trim()
});
