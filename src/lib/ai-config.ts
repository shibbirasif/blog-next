import { AIProvider } from '@/constants/ai';

export interface AIConfig {
    provider: AIProvider;
    maxTokens: number;
    temperature: number;
    maxRequestsPerMinute: number;
}

export const aiConfig: AIConfig = {
    provider: (process.env.AI_PROVIDER as AIProvider) || AIProvider.OLLAMA,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    maxRequestsPerMinute: parseInt(process.env.AI_MAX_REQUESTS_PER_MINUTE || '10'),
};

export const openAIConfig = {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

export const ollamaConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
};

export const geminiConfig = {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
};
