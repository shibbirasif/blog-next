import z from "zod";

export const createArticleSchema = z.object({
    title: z.string()
        .min(3, "Title must be at least 3 characters long")
        .max(200, "Title cannot exceed 200 characters")
        .trim(),
    content: z.string()
        .min(10, "Content must be at least 10 characters long")
        .refine((content) => content !== '<p></p>' && content.trim() !== '', {
            message: "Article content cannot be empty"
        }),
    author: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format"),
    tags: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tag ID format"))
        .optional()
        .default([]),
    isPublished: z.boolean()
        .optional()
        .default(false),
    seriesId: z.string()
        .max(100, "Series ID cannot exceed 100 characters")
        .trim()
        .optional(),
    partNumber: z.number()
        .int("Part number must be an integer")
        .min(1, "Part number must be at least 1")
        .max(9999, "Part number cannot exceed 9999")
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

export const clientCreateArticleSchema = createArticleSchema.omit({ author: true });

export const clientUpdateArticleSchema = updateArticleSchema.omit({ author: true, id: true });

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type PublishArticleInput = z.infer<typeof publishArticleSchema>;
export type ClientCreateArticleInput = z.infer<typeof clientCreateArticleSchema>;
export type ClientUpdateArticleInput = z.infer<typeof clientUpdateArticleSchema>;
