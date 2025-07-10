import z from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password cannot be empty"),
});

export const serverSignupSchema = z.object({
    name: z.string()
        .min(1, "You must put your name.")
        .max(100, "Name cannot exceed 100 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password cannot exceed 50 characters"),
});

export const clientSignupSchema = serverSignupSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export type LoginInput = z.infer<typeof loginSchema>;
export type ServerSignupInput = z.infer<typeof serverSignupSchema>;
export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
