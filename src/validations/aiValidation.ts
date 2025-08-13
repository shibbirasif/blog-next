import { z } from 'zod';
import { Tone, EnhancementType } from '@/constants/ai';

export const generateSchema = z.object({
    prompt: z.string().min(1).max(1000),
    context: z.string().optional(),
    options: z.object({
        tone: z.nativeEnum(Tone).optional(),
        language: z.string().optional(),
        maxLength: z.number().optional(),
    }).optional(),
});

export const completeSchema = z.object({
    text: z.string().min(1).max(2000),
    options: z.object({
        tone: z.nativeEnum(Tone).optional(),
    }).optional(),
});

export const enhanceSchema = z.object({
    content: z.string().min(1).max(5000),
    type: z.nativeEnum(EnhancementType),
    options: z.object({
        tone: z.nativeEnum(Tone).optional(),
    }).optional(),
});

export type GenerateRequest = z.infer<typeof generateSchema>;
export type CompleteRequest = z.infer<typeof completeSchema>;
export type EnhanceRequest = z.infer<typeof enhanceSchema>;
