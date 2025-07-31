import { z } from "zod";

export const userNameSchema = z.object({
    name: z.string()
        .min(1, "You must put your name.")
        .max(100, "Name cannot exceed 100 characters")
});