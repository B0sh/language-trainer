import { AIProvider, AICapabilities, LLMRequest, LLMResult, LLMChatRequest, LLMChatResult, JSONSchema } from "../interfaces";
// https://github.com/ollama/ollama-js/issues/151
// must be manually imported from dist file because of upstream issue with ollama bundling
import ollama, { ChatRequest, ChatResponse, ListResponse, Message, ModelResponse } from "ollama/dist/browser.cjs";

interface LlamaConfig {
    model: string;
}

export class LlamaProvider extends AIProvider {
    readonly name = "Llama (Local)";
    readonly description = "Locally installed Llama model";
    readonly capabilities: AICapabilities = {
        canGenerateText: true,
        canTextToSpeech: false,
        canSpeechToText: false,
    };

    private model: string;

    constructor(config?: LlamaConfig) {
        super();
        if (config) {
            this.configure(config);
        }
    }

    configure(config: LlamaConfig): void {
        this.model = config.model;
    }

    validateConfig(): string {
        if (!this.model) {
            return "Llama model is not configured";
        }

        return "";
    }

    async llm(request: LLMRequest): Promise<LLMResult> {
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        // Sad typescript assertion
        const dto: ChatRequest & { stream?: false } = {
            model: this.model,
            messages: [{ role: "user", content: request.prompt }],
            stream: false,
            options: {
                temperature: request.temperature ?? 0.7,
            },
        };

        if (request.format == "json" || request.jsonSchema) {
            dto.format = "json";
        }

        const response: ChatResponse = await ollama.chat(dto);

        return {
            response: response.message.content,
            tokens: response.eval_count,
        };
    }

    async llmChat(request: LLMChatRequest): Promise<LLMChatResult> {
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        // Sad typescript assertion
        const dto: ChatRequest & { stream?: false } = {
            model: this.model,
            messages: request.messages,
            stream: false,
            options: {
                temperature: request.temperature ?? 0.7,
            },
        };

        if (request.jsonSchema) {
            dto.format = "json";
        }

        const response: ChatResponse = await ollama.chat(dto);

        return {
            response: {
                role: "assistant",
                content: response.message.content,
            },
            tokens: response.eval_count,
            metadata: {
                model: this.model,
                temperature: request.temperature,
            },
        };
    }

    static async listModels(): Promise<ModelResponse[]> {
        const response: ListResponse = await ollama.list();

        return response.models;
    }
}
