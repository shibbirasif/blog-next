import { z } from "zod";
import { userNameSchema } from './userName';

import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/uploads";
import { isHtmlContentValid } from "@/utils/sanitization";

export const profileEditSchema = z.object({
    name: userNameSchema.shape.name,
    bio: z.string().optional()
        .refine((bio) => bio === undefined || bio.trim() === '' || isHtmlContentValid(bio), {
            message: "Invalid HTML is not allowed. Please review and use only safe formatting."
        }),
    avatar: z
        .instanceof(File)
        .refine((file) => file.size > 0, "File cannot be empty")
        .refine((file) => file.size <= MAX_FILE_SIZE, `File size too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.`)
        .refine(
            (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
            "Invalid file type. Only images are allowed."
        ).optional(),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;