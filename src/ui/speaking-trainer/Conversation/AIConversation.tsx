import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppSettings } from "../../../models/app-settings";
import { getTargetLanguage } from "../../../shared/languages";
import { MessageInput } from "./MessageInput";
import type SlTextareaElement from "@shoelace-style/shoelace/dist/components/textarea/textarea";
import "./AIConversation.css";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js";
import { ConversationChallenge } from "./ConversationChallenge";
import { AIProviderRegistry } from "../../../ai/registry";
import { useErrorBoundary } from "react-error-boundary";
import { LLMChatMessage } from "../../../ai/interfaces";
import { ConversationAnalysis } from "../../../ai/prompts/conversation-prompts";
import { Messages } from "./Messages";
import { ConversationPrompt } from "./ConversationPrompt";
import { sleep } from "../../../shared/utility";

interface Props {
    settings: AppSettings;
}

export const AIConversation: React.FC<Props> = ({ settings }) => {
    const [conversation] = useState(
        () => new ConversationChallenge(settings.targetLanguage, settings.targetLanguageLevel)
    );
    const [messages, setMessages] = useState<LLMChatMessage[]>([]);
    const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);

    // const [messages, setMessages] = useState<LLMChatMessage[]>([
    //     {
    //         role: "user",
    //         content: "どー亜が好き",
    //     },
    //     {
    //         role: "assistant",
    //         content:
    //             "「どー亜」とは、具体的にどのような「開く」という意味でしょうか？ 心理的な「開く」、物理的な「開く」、それとも比喩的な表現でしょうか？  もう少し詳しく教えていただけますか？ 例えば、お店の開店について話したいのであれば、どのようなお店ですか？",
    //     },
    // ]);
    // const [analysis, setAnalysis] = useState<ConversationAnalysis | null>({
    //     noFeedback: false,
    //     corrections: [
    //         {
    //             messageIndex: 0,
    //             original: "どー亜が好き",
    //             suggestedText: "ドアが好き",
    //             explanation: "「どー亜」は誤字です。正しくは「ドア」です。",
    //         },
    //     ],
    // });

    const [playbackStatus, setPlaybackStatus] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [, forceUpdate] = useState({});
    const { showBoundary } = useErrorBoundary();

    const textareaRef = useRef<SlTextareaElement>(null);
    const targetLanguage = getTargetLanguage(settings.targetLanguage);

    const handleSubmit = useCallback(
        async (message: string) => {
            setPlaybackStatus("loading_chat");
            if (conversation.loading) return;

            const nextMessage: LLMChatMessage = {
                role: "user",
                content: message,
            };

            setMessages((prev) => [...prev, nextMessage]);

            try {
                // await sleep(4000);
                const result = await conversation.submitMessage(nextMessage);
                setMessages((prev) => [...prev, result]);
                setPlaybackStatus("loading_audio");
            } catch (error) {
                const provider = AIProviderRegistry.getActiveProvider("llm");
                showBoundary(`Failed to request LLM with ${provider.name}.\n\n${error.message}`);
                return;
            }

            try {
                await conversation.generateAudio();
                setPlaybackStatus("playing");
                await conversation.playAudio(settings.volume);
                setPlaybackStatus("finished");
            } catch (error) {
                const provider = AIProviderRegistry.getActiveProvider("tts");
                showBoundary(`Failed to perform Text-to-Speech with ${provider.name}.\n\n${error.message}`);
            }

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        },
        [conversation]
    );

    const handleFinish = useCallback(async () => {
        setLoading(true);

        try {
            const analysis = await conversation.generateAnalysis();
            setLoading(false);
            setAnalysis(analysis);
        } catch (error) {
            const provider = AIProviderRegistry.getActiveProvider("llm");
            showBoundary(`Failed to request LLM with ${provider.name}.\n\n${error.message}`);
            return;
        } finally {
            setLoading(false);
        }
    }, [conversation]);

    const handleWordSelect = useCallback(
        (word: string) => {
            conversation.setInspirationWord(word);
            forceUpdate({});
        },
        [conversation]
    );

    if (loading) {
        return (
            <div className="chat-container empty loading">
                <SlSpinner className="large-spinner" />
            </div>
        );
    }

    return (
        <div className={`chat-container ${messages.length === 0 ? "empty" : ""}`}>
            {messages.length === 0 ? (
                <ConversationPrompt
                    inspirationWord={conversation.inspirationWord}
                    settings={settings}
                    onWordSelect={handleWordSelect}
                />
            ) : (
                <Messages messages={messages} playbackStatus={playbackStatus} analysis={analysis} />
            )}

            <MessageInput
                onSubmit={handleSubmit}
                onFinish={messages.length > 0 && handleFinish}
                isLoading={conversation.loading}
                textareaRef={textareaRef}
            />
        </div>
    );
};
