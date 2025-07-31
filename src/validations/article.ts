import { z } from "zod";
import { isPlainTextValid, isHtmlContentValid } from '@/utils/sanitization';

export const createArticleSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Title is required")
        .min(3, "Title must be at least 3 characters long")
        .max(200, "Title cannot exceed 200 characters")
        .refine((title) => {
            return isPlainTextValid(title);
        }, {
            message: "HTML text not supported. Please use plain text only."
        }),
    content: z.string()
        .min(1, "You must write something")
        .min(10, "Content must be at least 10 characters long")
        .refine((content) => content !== '<p></p>' && content.trim() !== '', {
            message: "You must write something for your article"
        })
        .refine((content) => {
            return isHtmlContentValid(content);
        }, {
            message: "Invalid HTML is not allowed. Please review and use only safe formatting."
        }),
    author: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format"),
    tags: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tag ID format"))
        .min(1, "At least one tag is required"),
    isPublished: z.boolean()
        .optional()
});

export const updateArticleSchema = createArticleSchema.partial().extend({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid article ID format")
});

export const publishArticleSchema = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid article ID format"),
    isPublished: z.boolean()
});

export const clientCreateArticleSchema = createArticleSchema.omit({ author: true }).extend({
    uploadedFileIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID format")).optional()
});

export const clientUpdateArticleSchema = updateArticleSchema.omit({ author: true, id: true }).extend({
    uploadedFileIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID format")).optional()
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type PublishArticleInput = z.infer<typeof publishArticleSchema>;
export type ClientCreateArticleInput = z.infer<typeof clientCreateArticleSchema>;
export type ClientUpdateArticleInput = z.infer<typeof clientUpdateArticleSchema>;
