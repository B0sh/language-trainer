import {
    AICapabilities,
    AIProvider,
    LLMRequest,
    LLMResult,
    TTSAudio,
    TTSRequest,
    LLMChatRequest,
    LLMChatResult,
} from "./interfaces";
import { BrowserProvider } from "./browser/BrowserProvider";
import { OpenAIProvider } from "./openai/OpenAIProvider";
import { GoogleProvider } from "./google/GoogleProvider";
import { LlamaProvider } from "./llama/LlamaProvider";
import { OpenRouterProvider } from "./openrouter/OpenRouterProvider";
import { WaldensWorldProvider } from "./waldensworld/WaldensWorldProvider";
import { aiRequestDB } from "./db";

type AiProviderFactory = new (...args: any[]) => AIProvider;

export class AIProviderRegistry {
    private static providers = new Map<string, AiProviderFactory>();
    private static activeProviders = new Map<string, AIProvider>();
    private static sttProcessing = false;
    private static llmProcessing = false;
    private static ttsProcessing = false;

    static registerDefaults() {
        this.registerProvider("browser", BrowserProvider);
        this.registerProvider("openai", OpenAIProvider);
        this.registerProvider("google", GoogleProvider);
        this.registerProvider("llama", LlamaProvider);
        this.registerProvider("openrouter", OpenRouterProvider);
        this.registerProvider("waldensworld", WaldensWorldProvider);
    }

    static registerProvider(id: string, providerClass: AiProviderFactory) {
        this.providers.set(id, providerClass);
    }

    static getProviderClass(id: string): AiProviderFactory {
        const provider = this.providers.get(id);
        if (!provider) {
            throw new Error(`Provider ${id} not found`);
        }
        return provider;
    }

    static getAvailableProviders(): Array<{
        id: string;
        name: string;
        description: string;
        capabilities: AICapabilities;
    }> {
        return Array.from(this.providers.entries()).map(([id, Provider]) => {
            const instance = new Provider();
            return {
                id,
                name: instance.name,
                description: instance.description,
                capabilities: instance.capabilities,
            };
        });
    }

    static setActiveProvider(type: "tts" | "stt" | "llm", provider: AIProvider) {
        if (type === "tts" && !provider.capabilities.canTextToSpeech) {
            throw new Error(`Provider ${provider.name} does not support text-to-speech`);
        }
        if (type === "stt" && !provider.capabilities.canSpeechToText) {
            throw new Error(`Provider ${provider.name} does not support speech-to-text`);
        }
        if (type === "llm" && !provider.capabilities.canGenerateText) {
            throw new Error(`Provider ${provider.name} does not support text generation`);
        }
        this.activeProviders.set(type, provider);
    }

    static getActiveProvider(type: "tts" | "stt" | "llm"): AIProvider {
        const provider = this.activeProviders.get(type);
        if (!provider) {
            throw new Error(`No active provider set for ${type}`);
        }
        return provider;
    }

    static async textToSpeech(request: TTSRequest): Promise<TTSAudio | undefined> {
        const provider = this.getActiveProvider("tts");
        if (!provider.textToSpeech) {
            throw new Error(`Provider ${provider.name} does not support text-to-speech`);
        }
        if (this.ttsProcessing) {
            return;
        }

        this.ttsProcessing = true;
        try {
            const result = await provider.textToSpeech(request);

            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "tts",
                inputText: request.text,
                metadata: result.metadata,
                response: "success",
            });

            return result;
        } catch (error) {
            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "tts",
                inputText: request.text,
                response: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        } finally {
            this.ttsProcessing = false;
        }
    }

    static async speechToText(audioData: ArrayBuffer | MediaStream, options?: any) {
        const provider = this.getActiveProvider("stt");
        if (!provider.speechToText) {
            throw new Error(`Provider ${provider.name} does not support speech-to-text`);
        }
        if (this.sttProcessing) {
            return "";
        }
        this.sttProcessing = true;
        try {
            const result = await provider.speechToText(audioData, options);

            // await aiRequestDB.logRequest({
            //     provider: provider.name,
            //     requestType: "stt",
            //     outputText: result,
            //     options: { blobSize: audio.size },
            //     response: "success",
            // });

            return result;
        } catch (error) {
            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "stt",
                response: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        } finally {
            this.sttProcessing = false;
        }
    }

    static async llm(request: LLMRequest): Promise<LLMResult> {
        const provider = this.getActiveProvider("llm");
        if (!provider.llm) {
            throw new Error(`Provider ${provider.name} does not support text generation`);
        }
        if (this.llmProcessing) {
            return;
        }

        this.llmProcessing = true;
        try {
            const result = await provider.llm(request);

            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "llm",
                inputText: request.prompt,
                outputText: result.response,
                metadata: result.metadata,
                response: "success",
            });

            return result;
        } catch (error) {
            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "llm",
                inputText: request.prompt,
                response: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        } finally {
            this.llmProcessing = false;
        }
    }

    static async llmChat(request: LLMChatRequest): Promise<LLMChatResult> {
        const provider = this.getActiveProvider("llm");
        if (!provider.llmChat) {
            throw new Error(`Provider ${provider.name} does not support chat generation`);
        }
        if (this.llmProcessing) {
            return;
        }

        this.llmProcessing = true;
        try {
            const result = await provider.llmChat(request);

            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "llm_chat",
                inputText: JSON.stringify(request.messages),
                outputText: JSON.stringify(result.response),
                metadata: result.metadata,
                response: "success",
            });

            return result;
        } catch (error) {
            await aiRequestDB.logRequest({
                provider: provider.name,
                requestType: "llm_chat",
                inputText: JSON.stringify(request.messages),
                response: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        } finally {
            this.llmProcessing = false;
        }
    }
}
AIProviderRegistry.registerDefaults();
