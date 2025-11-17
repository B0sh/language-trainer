import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AIProvider, AICapabilities, LLMRequest, LLMResult, LLMChatRequest, LLMChatResult, JSONSchema } from "../interfaces";
import OpenAI from "openai";

export interface OpenAIConfig {
    apiKey: string;
    organization?: string;
}

export class OpenAIProvider extends AIProvider {
    readonly name = "OpenAI";
    readonly description = "OpenAI's suite of AI models including GPT-4, Whisper, and TTS";
    readonly capabilities: AICapabilities = {
        canGenerateText: true,
        // Open AI text to speech does not support setting a language type
        // When it reads out numbers, it always reads them in English
        canTextToSpeech: false,
        canSpeechToText: true,
    };

    private apiKey?: string;
    private organization?: string;
    private openai?: OpenAI;

    constructor(config?: OpenAIConfig) {
        super();
        if (config) {
            this.configure(config);
        }
    }

    configure(config: OpenAIConfig): void {
        this.apiKey = config.apiKey;
        this.organization = config.organization;

        if (this.openai) {
            this.openai.apiKey = this.apiKey;
            this.openai.organization = this.organization;
        } else {
            this.openai = new OpenAI({
                apiKey: this.apiKey,
                organization: this.organization,
                // Since your open API key is stored in localStorage, we need to enable this.
                // Perhaps in the future we could run AI logic this in the main electron process,
                // however that would make impossible to port to a browser in the future
                dangerouslyAllowBrowser: true,
            });
        }
    }

    validateConfig(): string {
        if (!this.apiKey) {
            return "OpenAI API key is not configured";
        }

        return "";
    }

    async llm(request: LLMRequest): Promise<LLMResult> {
        const startTime = performance.now();
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        if (!this.openai) {
            throw new Error("OpenAI API client is not initialized");
        }

        const requestData: any = {
            model: request.model || "gpt-4o-mini",
            messages: [{ role: "user", content: request.prompt }],
        };

        // Add structured output if JSON schema is provided
        if (request.jsonSchema) {
            requestData.response_format = {
                type: "json_schema",
                json_schema: {
                    name: "structured_response",
                    schema: request.jsonSchema,
                    strict: true
                }
            };
        }

        const completion: ChatCompletion = await this.openai.chat.completions.create(
            requestData,
            {
                stream: false,
            }
        );
        const endTime = performance.now();

        return {
            response: completion.choices[0].message.content,
            tokens: completion.usage.total_tokens,
            metadata: {
                model: request.model || "gpt-4o-mini",
                temperature: request.temperature,
                duration: endTime - startTime,
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
            },
        };
    }

    async llmChat(request: LLMChatRequest): Promise<LLMChatResult> {
        const startTime = performance.now();
        const validation = this.validateConfig();
        if (validation) {
            throw new Error(validation);
        }

        if (!this.openai) {
            throw new Error("OpenAI API client is not initialized");
        }

        const requestData: any = {
            model: request.model || "gpt-4o-mini",
            messages: request.messages,
            temperature: request.temperature,
        };

        // Add structured output if JSON schema is provided
        if (request.jsonSchema) {
            requestData.response_format = {
                type: "json_schema",
                json_schema: {
                    name: "structured_response",
                    schema: request.jsonSchema,
                    strict: true
                }
            };
        }

        const completion = await this.openai.chat.completions.create(
            requestData,
            {
                stream: false,
            }
        );
        const endTime = performance.now();

        return {
            response: completion.choices[0].message,
            tokens: completion.usage.total_tokens,
            metadata: {
                model: request.model || "gpt-4o-mini",
                temperature: request.temperature,
                duration: endTime - startTime,
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
            },
        };
    }

    // async speechToText(audioData: ArrayBuffer): Promise<SpeechToTextResult> {
    //     const validation = this.validateConfig();
    //     if (validation) {
    //         throw new Error(validation);
    //     }

    //     if (!this.openai) {
    //         throw new Error("OpenAI API client is not initialized");
    //     }

    //     const formData = new FormData();
    //     const audioBlob = new Blob([audioData], { type: "audio/wav" });
    //     formData.append("file", audioBlob, "audio.wav");
    //     formData.append("model", "whisper-1");

    //     const response = await this.openai.audio.transcriptions.create({
    //         file: audioBlob,
    //         model: "whisper-1",
    //     });

    //     return {
    //         text: response.text,
    //     };
    // }
}
