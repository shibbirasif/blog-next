import { z } from "zod";
import { userNameSchema } from './userName';

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password cannot be empty"),
});

export const serverSignupSchema = z.object({
    name: userNameSchema.shape.name,
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password cannot exceed 50 characters"),
});

export const clientSignupSchema = serverSignupSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password cannot exceed 50 characters"),
});

export const clientResetPasswordSchema = resetPasswordSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export type LoginInput = z.infer<typeof loginSchema>;
export type ServerSignupInput = z.infer<typeof serverSignupSchema>;
export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ClientResetPasswordInput = z.infer<typeof clientResetPasswordSchema>;
