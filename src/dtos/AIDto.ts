import { AIFeatureType, Tone } from '@/constants/ai';

export interface AIRequestDto {
    type: AIFeatureType;
    prompt: string;
    context?: string;
    options?: {
        tone?: Tone;
        language?: string;
        maxLength?: number;
    };
}

export interface AIResponseDto {
    success: boolean;
    content?: string;
    error?: string;
    usage?: {
        tokens: number;
        cost: number;
    };
}
