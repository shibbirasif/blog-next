import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../constants/uploads';

export const uploadArticleFileSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'File cannot be empty')
        .refine((file) => file.size <= MAX_FILE_SIZE, 'File size too large. Maximum 5MB allowed.')
        .refine(
            (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
            'Invalid file type. Only images are allowed.'
        ),
    altText: z.string().optional(),
    articleId: z.string().optional()
});
