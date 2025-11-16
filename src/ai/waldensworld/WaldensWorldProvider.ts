import { AIProvider, AICapabilities, LLMRequest, LLMResult, LLMChatRequest, LLMChatResult } from "../interfaces";

export interface WaldensWorldConfig {
    baseURL?: string;
}

interface WaldensWorldChatCompletion {
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

export class WaldensWorldProvider extends AIProvider {
    readonly name = "Walden's World";
    readonly description = "Walden's hosted AI service - no API key required";
    readonly capabilities: AICapabilities = {
        canGenerateText: true,
        canTextToSpeech: false,
        canSpeechToText: false,
    };

    private baseURL: string = "http://localhost:3001/api/v1";

    constructor(config?: WaldensWorldConfig) {
        super();
        if (config) {
            this.configure(config);
        }
    }

    configure(config: WaldensWorldConfig): void {
        if (config.baseURL) {
            this.baseURL = config.baseURL;
        }
    }

    validateConfig(): string {
        // No API key validation needed since this is a hosted service
        return "";
    }

    private async makeRequest(endpoint: string, data: Record<string, unknown>): Promise<WaldensWorldChatCompletion> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Referer': window.location.origin,
                'X-Title': 'Language Trainer',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            throw new Error(`Walden's World API error: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    async llm(request: LLMRequest): Promise<LLMResult> {
        const startTime = performance.now();

        const messages = [{ role: "user", content: request.prompt }];
        const requestData = {
            model: request.model,
            messages: messages,
            temperature: request.temperature,
        };

        const completion: WaldensWorldChatCompletion = await this.makeRequest('/chat/completions', requestData);
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

        const requestData = {
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
        };

        const completion: WaldensWorldChatCompletion = await this.makeRequest('/chat/completions', requestData);
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