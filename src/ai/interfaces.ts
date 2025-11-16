export interface TTSRequest {
    text: string;
    language: string;
    voice?: "default" | "random" | string;
    speed?: number;
    pitch?: number;
}

export interface SpeechToTextOptions {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

export interface SpeechToTextResult {
    text: string;
    confidence: number;
    isFinal: boolean;
    metadata?: Record<string, any>;
}

export interface LLMRequest {
    prompt: string;
    temperature?: number;
    model?: string;
    format?: "json" | "text";
}

export interface LLMResult {
    response: string;
    tokens?: number;
    metadata?: Record<string, any>;
}

export interface LLMChatRequest {
    messages: LLMChatMessage[];
    temperature?: number;
    model?: string;
}

export interface LLMChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LLMChatResult {
    response: LLMChatMessage;
    tokens?: number;
    metadata?: Record<string, any>;
}

export interface AICapabilities {
    canGenerateText: boolean;
    canTextToSpeech: boolean;
    canSpeechToText: boolean;
}

export abstract class AIProvider {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly capabilities: AICapabilities;

    validateConfig(): string {
        throw new Error("Method not implemented");
    }

    textToSpeech?(request: TTSRequest): Promise<TTSAudio> {
        throw new Error("Text to speech not supported by this provider");
    }

    speechToText?(audioData: ArrayBuffer | MediaStream, options?: SpeechToTextOptions): Promise<SpeechToTextResult> {
        throw new Error("Speech to text not supported by this provider");
    }

    llm?(request: LLMRequest): Promise<LLMResult> {
        throw new Error("Text generation not supported by this provider");
    }

    llmChat?(request: LLMChatRequest): Promise<LLMChatResult> {
        throw new Error("Chat generation not supported by this provider");
    }

    configure?(config: Record<string, any>): void {
        throw new Error("Method not implemented");
    }
}

export abstract class TTSAudio {
    text: string;
    duration: number;
    metadata?: Record<string, unknown>;

    abstract play(volume?: number): Promise<void>;
    abstract stop(): Promise<void>;
    abstract pause(): Promise<void>;
    abstract resume(): Promise<void>;
}
