import OpenAI from 'openai';
import { Ollama } from 'ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig, openAIConfig, ollamaConfig, geminiConfig } from '@/lib/ai-config';
import { AIProvider, Tone, EnhancementType, AIFeatureType } from '@/constants/ai';
import { AIRequestDto, AIResponseDto } from '@/dtos/AIDto';

class AIService {
    /**
     * Get the configured AI agent based on the current provider
     */
    getAIAgent(): OpenAI | Ollama | GoogleGenerativeAI {
        switch (aiConfig.provider) {
            case AIProvider.OPENAI:
                if (!openAIConfig.apiKey) {
                    throw new Error('OpenAI API key not configured');
                }
                return new OpenAI({
                    apiKey: openAIConfig.apiKey,
                });

            case AIProvider.OLLAMA:
                return new Ollama({
                    host: ollamaConfig.baseUrl,
                });

            case AIProvider.GEMINI:
                if (!geminiConfig.apiKey) {
                    throw new Error('Gemini API key not configured');
                }
                return new GoogleGenerativeAI(geminiConfig.apiKey);

            default:
                throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
        }
    }


    async generateContent(prompt: string, context?: string, options?: AIRequestDto['options']): Promise<AIResponseDto> {
        try {
            const systemPrompt = this.buildSystemPrompt('generate', options);
            const userPrompt = context ? `Context: ${context}\n\nPrompt: ${prompt}` : prompt;
            const aiAgent = this.getAIAgent();

            if (aiConfig.provider === AIProvider.OPENAI) {
                return await this.callOpenAI(aiAgent as OpenAI, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.OLLAMA) {
                return await this.callOllama(aiAgent as Ollama, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.GEMINI) {
                return await this.callGemini(aiAgent as GoogleGenerativeAI, systemPrompt, userPrompt);
            } else {
                throw new Error(`AI provider ${aiConfig.provider} not configured`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async completeText(text: string, options?: AIRequestDto['options']): Promise<AIResponseDto> {
        try {
            const systemPrompt = this.buildSystemPrompt('complete', options);
            const userPrompt = `Complete this text naturally and coherently: ${text}`;
            const aiAgent = this.getAIAgent();

            if (aiConfig.provider === AIProvider.OPENAI) {
                return await this.callOpenAI(aiAgent as OpenAI, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.OLLAMA) {
                return await this.callOllama(aiAgent as Ollama, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.GEMINI) {
                return await this.callGemini(aiAgent as GoogleGenerativeAI, systemPrompt, userPrompt);
            } else {
                throw new Error(`AI provider ${aiConfig.provider} not configured`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async enhanceContent(content: string, enhancementType: EnhancementType, options?: AIRequestDto['options']): Promise<AIResponseDto> {
        try {
            const systemPrompt = this.buildSystemPrompt('enhance', { ...options, enhancementType });
            const userPrompt = `Improve this content for ${enhancementType}: ${content}`;
            const aiAgent = this.getAIAgent();

            if (aiConfig.provider === AIProvider.OPENAI) {
                return await this.callOpenAI(aiAgent as OpenAI, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.OLLAMA) {
                return await this.callOllama(aiAgent as Ollama, systemPrompt, userPrompt);
            } else if (aiConfig.provider === AIProvider.GEMINI) {
                return await this.callGemini(aiAgent as GoogleGenerativeAI, systemPrompt, userPrompt);
            } else {
                throw new Error(`AI provider ${aiConfig.provider} not configured`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private buildSystemPrompt(type: AIFeatureType, options?: { tone?: Tone | string; enhancementType?: string }): string {
        const basePrompt = "You are a helpful writing assistant.";

        switch (type) {
            case 'generate':
                return `${basePrompt} Generate creative and engaging content based on the user's prompt. ${options?.tone ? `Use a ${options.tone} tone.` : ''} Keep responses concise and relevant.`;

            case 'complete':
                return `${basePrompt} Complete the given text naturally and coherently. ${options?.tone ? `Maintain a ${options.tone} tone.` : ''} Continue where the text left off seamlessly.`;

            case 'enhance':
                const enhancementType = options?.enhancementType || 'general';
                return `${basePrompt} Improve the given content for ${enhancementType}. ${options?.tone ? `Use a ${options.tone} tone.` : ''} Make it better while preserving the original meaning.`;

            default:
                return basePrompt;
        }
    }

    private async callOpenAI(openai: OpenAI, systemPrompt: string, userPrompt: string): Promise<AIResponseDto> {
        const response = await openai.chat.completions.create({
            model: openAIConfig.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: aiConfig.maxTokens,
            temperature: aiConfig.temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content generated');
        }

        return {
            success: true,
            content: content.trim(),
            usage: {
                tokens: response.usage?.total_tokens || 0,
                cost: this.calculateOpenAICost(response.usage?.total_tokens || 0)
            }
        };
    }

    private async callOllama(ollama: Ollama, systemPrompt: string, userPrompt: string): Promise<AIResponseDto> {
        try {
            const response = await ollama.chat({
                model: ollamaConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                options: {
                    temperature: aiConfig.temperature,
                    num_predict: aiConfig.maxTokens,
                }
            });

            if (!response.message?.content) {
                throw new Error('No content generated by Ollama');
            }

            return {
                success: true,
                content: response.message.content.trim(),
                usage: {
                    tokens: response.message.content.length / 4, // Rough estimation
                    cost: 0 // Local models are free
                }
            };
        } catch (error) {
            console.error('Ollama API error:', error);
            throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async callGemini(gemini: GoogleGenerativeAI, systemPrompt: string, userPrompt: string): Promise<AIResponseDto> {
        try {
            const model = gemini.getGenerativeModel({
                model: geminiConfig.model,
                systemInstruction: systemPrompt,
            });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                    maxOutputTokens: aiConfig.maxTokens,
                    temperature: aiConfig.temperature,
                },
            });

            const response = await result.response;
            const content = response.text();

            if (!content) {
                throw new Error('No content generated by Gemini');
            }

            return {
                success: true,
                content: content.trim(),
                usage: {
                    tokens: response.usageMetadata?.totalTokenCount || 0,
                    cost: this.calculateGeminiCost(response.usageMetadata?.totalTokenCount || 0)
                }
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private calculateOpenAICost(tokens: number): number {
        // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
        const costPerToken = 0.375 / 1000000; // Average
        return tokens * costPerToken;
    }

    private calculateGeminiCost(tokens: number): number {
        // Gemini 1.5 Flash pricing: $0.075 per 1M tokens (up to 128k), $0.30 per 1M tokens (128k+)
        const costPerToken = 0.075 / 1000000;
        return tokens * costPerToken;
    }

    async testConnection(): Promise<boolean> {
        try {
            const aiAgent = this.getAIAgent();

            if (aiConfig.provider === AIProvider.OLLAMA) {
                await (aiAgent as Ollama).list();
                return true;
            } else if (aiConfig.provider === AIProvider.GEMINI) {
                const model = (aiAgent as GoogleGenerativeAI).getGenerativeModel({ model: geminiConfig.model });
                await model.generateContent('test');
                return true;
            } else if (aiConfig.provider === AIProvider.OPENAI) {
                await (aiAgent as OpenAI).models.list();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    isConfigured(): boolean {
        try {
            this.getAIAgent();
            return true;
        } catch {
            return false;
        }
    }

    getProviderInfo(): { provider: string; model: string; local: boolean } {
        switch (aiConfig.provider) {
            case AIProvider.OPENAI:
                return { provider: 'OpenAI', model: openAIConfig.model, local: false };
            case AIProvider.OLLAMA:
                return { provider: 'Ollama', model: ollamaConfig.model, local: true };
            case AIProvider.GEMINI:
                return { provider: 'Google Gemini', model: geminiConfig.model, local: false };
            default:
                return { provider: 'Unknown', model: 'Unknown', local: false };
        }
    }

    async getServiceStatus(): Promise<{
        services: Array<{
            name: string;
            status: 'online' | 'offline' | 'error';
            latency?: number;
        }>;
        overall: 'online' | 'offline';
    }> {
        const services = [];
        let isActiveAgentOnline = false;

        // Test only the active AI agent
        try {
            const start = Date.now();
            const aiAgent = this.getAIAgent();
            const providerInfo = this.getProviderInfo();

            if (aiConfig.provider === AIProvider.OPENAI) {
                await (aiAgent as OpenAI).models.list();
                services.push({
                    name: `${providerInfo.provider} (${providerInfo.model})`,
                    status: 'online' as const,
                    latency: Date.now() - start
                });
                isActiveAgentOnline = true;
            } else if (aiConfig.provider === AIProvider.OLLAMA) {
                await (aiAgent as Ollama).list();
                services.push({
                    name: `${providerInfo.provider} (${providerInfo.model})`,
                    status: 'online' as const,
                    latency: Date.now() - start
                });
                isActiveAgentOnline = true;
            } else if (aiConfig.provider === AIProvider.GEMINI) {
                // Simple test - try to get model info
                (aiAgent as GoogleGenerativeAI).getGenerativeModel({ model: geminiConfig.model });
                // For Gemini, we'll just check if we can create the model instance
                services.push({
                    name: `${providerInfo.provider} (${providerInfo.model})`,
                    status: 'online' as const,
                    latency: Date.now() - start
                });
                isActiveAgentOnline = true;
            }
        } catch {
            const providerInfo = this.getProviderInfo();
            services.push({
                name: `${providerInfo.provider} (${providerInfo.model})`,
                status: 'error' as const
            });
        }

        // Return only online if the active agent is online, otherwise offline
        return {
            services,
            overall: isActiveAgentOnline ? 'online' : 'offline'
        };
    }
}

export const aiService = new AIService();