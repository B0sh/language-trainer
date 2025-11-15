import { LLMChatMessage, LLMChatRequest, TTSAudio, TTSRequest } from "../../../ai/interfaces";
import {
    ConversationAnalysis,
    PROMPT_CONVERSATION_ANALYSIS,
    SYSTEM_PROMPT_CONVERSATION_STARTER,
} from "../../../ai/prompts/conversation-prompts";
import { generateAIInspirationWord } from "../../../ai/prompts/ai-inspiration-words";
import { AIProviderRegistry } from "../../../ai/registry";
import { TargetLanguageLevel } from "../../../models/app-settings";

export class ConversationChallenge {
    public messages: LLMChatMessage[];
    public loading: boolean;
    public language: string;
    public targetLanguageLevel: TargetLanguageLevel;
    public ttsAudio: TTSAudio | null;
    public inspirationWord: string;

    constructor(language: string, targetLanguageLevel: TargetLanguageLevel) {
        this.messages = [];
        this.loading = false;
        this.language = language;
        this.targetLanguageLevel = targetLanguageLevel;
        this.inspirationWord = generateAIInspirationWord(this.language, this.targetLanguageLevel);
        this.ttsAudio = null;
    }

    public async submitMessage(newMessage: LLMChatMessage): Promise<LLMChatMessage> {
        if (this.loading) {
            return;
        }

        this.messages.push(newMessage);
        this.loading = true;

        const chatRequest: LLMChatRequest = {
            messages: [
                SYSTEM_PROMPT_CONVERSATION_STARTER(this.language, this.targetLanguageLevel, this.inspirationWord),
                ...this.messages,
            ],
        };

        const result = await AIProviderRegistry.llmChat(chatRequest);
        this.messages.push(result.response);

        this.loading = false;

        return result.response;
    }

    public async generateAudio(): Promise<void> {
        if (this.ttsAudio) {
            await this.ttsAudio.stop();
            this.ttsAudio = null;
        }

        const ttsRequest: TTSRequest = {
            text: this.messages[this.messages.length - 1].content,
            language: this.language,
        };

        const result = await AIProviderRegistry.textToSpeech(ttsRequest);
        if (result) {
            this.ttsAudio = result;
        }
    }

    public async generateAnalysis(): Promise<ConversationAnalysis> {
        if (this.ttsAudio) {
            await this.ttsAudio.stop();
            this.ttsAudio = null;
        }

        const request = PROMPT_CONVERSATION_ANALYSIS(this.language, this.messages);
        const result = await AIProviderRegistry.llm(request);

        try {
            const analysisData = JSON.parse(result.response);
            return analysisData;
        } catch {
            throw new Error("Failed to generate analysis: Invalid response format");
        }
    }

    public async playAudio(volume: number): Promise<void> {
        if (this.ttsAudio) {
            await this.ttsAudio.stop();
            await this.ttsAudio.play(volume);
        }
    }

    public startNewConversation(): void {
        this.messages = [];
        this.inspirationWord = generateAIInspirationWord(this.language, this.targetLanguageLevel);
    }

    public setInspirationWord(word: string) {
        this.inspirationWord = word;
    }
}
