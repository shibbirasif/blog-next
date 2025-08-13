'use client';

import { useState, useCallback } from 'react';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { AIRequestDto, AIResponseDto } from '@/dtos/AIDto';
import { EnhancementType } from '@/constants/ai';

export interface AIAssistantHook {
    isLoading: boolean;
    error: string | null;
    lastResponse: AIResponseDto | null;
    generateContent: (request: AIRequestDto) => Promise<AIResponseDto>;
    completeText: (text: string, options?: AIRequestDto['options']) => Promise<AIResponseDto>;
    enhanceContent: (content: string, type: EnhancementType, options?: AIRequestDto['options']) => Promise<AIResponseDto>;
    clearError: () => void;
}

export interface AIResponse {
    success: boolean;
    content?: string;
    error?: string;
    usage?: {
        tokens: number;
        cost: number;
    };
}

export interface UseAIAssistantReturn {
    isLoading: boolean;
    error: string | null;
    lastResponse: AIResponseDto | null;
    generateContent: (request: AIRequestDto) => Promise<AIResponseDto>;
    completeText: (text: string, options?: AIRequestDto['options']) => Promise<AIResponseDto>;
    enhanceContent: (content: string, type: EnhancementType, options?: AIRequestDto['options']) => Promise<AIResponseDto>;
    clearError: () => void;
}

export const useAIAssistant = (): UseAIAssistantReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<AIResponseDto | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const makeAIRequest = useCallback(async (
        route: string,
        body: AIRequestDto | Record<string, unknown>,
        errorMessage: string
    ): Promise<AIResponseDto> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiFetcher<AIResponseDto>(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setLastResponse(response);

            if (!response.success) {
                setError(response.error || errorMessage);
            }

            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(message);
            const errorResponse: AIResponseDto = { success: false, error: message };
            setLastResponse(errorResponse);
            return errorResponse;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateContent = useCallback(async (request: AIRequestDto): Promise<AIResponseDto> => {
        return makeAIRequest(
            API_ROUTES.AI.GENERATE(),
            request,
            'Failed to generate content'
        );
    }, [makeAIRequest]);

    const completeText = useCallback(async (text: string, options?: AIRequestDto['options']): Promise<AIResponseDto> => {
        return makeAIRequest(
            API_ROUTES.AI.COMPLETE(),
            { text, options },
            'Failed to complete text'
        );
    }, [makeAIRequest]);

    const enhanceContent = useCallback(async (
        content: string,
        type: EnhancementType,
        options?: AIRequestDto['options']
    ): Promise<AIResponseDto> => {
        return makeAIRequest(
            API_ROUTES.AI.ENHANCE(),
            { content, type, options },
            'Failed to enhance content'
        );
    }, [makeAIRequest]);

    return {
        isLoading,
        error,
        lastResponse,
        generateContent,
        completeText,
        enhanceContent,
        clearError,
    };
};