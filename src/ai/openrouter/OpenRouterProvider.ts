import { AIProvider, AICapabilities, LLMRequest, LLMResult, LLMChatRequest, LLMChatResult } from "../interfaces";

export interface OpenRouterConfig {
    apiKey: string;
    model?: string;
    baseURL?: string;
}

interface OpenRouterChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenRouterProvider extends AIProvider {
    readonly name = "OpenRouter";
    readonly description = "OpenRouter's unified API for accessing multiple AI models";
    readonly capabilities: AICapabilities = {
        canGenerateText: true,
        canTextToSpeech: false,
        canSpeechToText: false,
    };

    private apiKey?: string;
    private model?: string;
    private baseURL: string = "https://openrouter.ai/api/v1";

    constructor(config?: OpenRouterConfig) {
        super();
        if (config) {
            this.configure(config);
        }
    }

    configure(config: OpenRouterConfig): void {
        this.apiKey = config.apiKey;
        this.model = config.model;
        if (config.baseURL) {
            this.baseURL = config.baseURL;
        }
    }

    validateConfig(): string {
        if (!this.apiKey) {
            return "OpenRouter API key is not configured";
        }
        return "";
    }

    private async makeRequest(endpoint: string, data: Record<string, unknown>): Promise<OpenRouterChatCompletion> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Language Trainer',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    async llm(request: LLMRequest): Promise<LLMResult> {
        const startTime = performance.now();
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        const messages = [{ role: "user", content: request.prompt }];
        const requestData = {
            model: request.model || this.model,
            messages: messages,
            temperature: request.temperature,
        };

        const completion: OpenRouterChatCompletion = await this.makeRequest('/chat/completions', requestData);
        const endTime = performance.now();

        return {
            response: completion.choices[0].message.content,
            tokens: completion.usage?.total_tokens,
            metadata: {
                model: completion.model,
                temperature: request.temperature,
                duration: endTime - startTime,
                promptTokens: completion.usage?.prompt_tokens,
                completionTokens: completion.usage?.completion_tokens,
            },
        };
    }

    async llmChat(request: LLMChatRequest): Promise<LLMChatResult> {
        const startTime = performance.now();
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        const requestData = {
            model: request.model || this.model,
            messages: request.messages,
            temperature: request.temperature,
        };

        const completion: OpenRouterChatCompletion = await this.makeRequest('/chat/completions', requestData);
        const endTime = performance.now();

        return {
            response: {
                role: completion.choices[0].message.role as "assistant",
                content: completion.choices[0].message.content,
            },
            tokens: completion.usage?.total_tokens,
            metadata: {
                model: completion.model,
                temperature: request.temperature,
                duration: endTime - startTime,
                promptTokens: completion.usage?.prompt_tokens,
                completionTokens: completion.usage?.completion_tokens,
            },
        };
    }
}
