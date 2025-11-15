import * as React from "react";
import { useEffect, useRef } from "react";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js";
import { LLMChatMessage } from "../../../ai/interfaces";
import { ConversationAnalysis } from "../../../ai/prompts/conversation-prompts";
import { Message } from "./Message";

interface Props {
    messages: LLMChatMessage[];
    playbackStatus: string;
    analysis: ConversationAnalysis | null;
}

export const Messages: React.FC<Props> = ({ messages, playbackStatus, analysis }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="messages-container">
            {messages.map((message, index) => {
                return (
                    <Message
                        key={index}
                        message={message}
                        index={index}
                        analysis={analysis}
                        typewriterAnimation={!analysis && message.role === "assistant" && messages.length - 1 === index}
                    />
                );
            })}
            {playbackStatus === "loading_chat" && <SlSpinner style={{ fontSize: "1.5rem" }} />}
            {analysis && analysis.noFeedback && (
                <div className="no-feedback-message">There was no feedback for your messages.</div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};
