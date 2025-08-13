export enum AIProvider {
    OPENAI = 'openai',
    OLLAMA = 'ollama',
    GEMINI = 'gemini'
}

export enum Tone {
    FORMAL = 'formal',
    CASUAL = 'casual',
    PROFESSIONAL = 'professional'
}

export enum EnhancementType {
    GRAMMAR = 'grammar',
    STYLE = 'style',
    SEO = 'seo'
}

export type AIFeatureType = 'generate' | 'complete' | 'enhance' | 'summarize' | 'translate';
