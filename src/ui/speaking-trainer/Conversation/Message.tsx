import * as React from "react";
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import { useState } from "react";
import { LLMChatMessage } from "../../../ai/interfaces";
import { ConversationAnalysis } from "../../../ai/prompts/conversation-prompts";
import { TextDiff } from "../../shared/TextDiff";
import { TypewriterEffect } from "../../shared/TypewriterEffect";
import { CorrectionDialog } from "./CorrectionDialog";

interface MessageProps {
    message: LLMChatMessage;
    index: number;
    analysis: ConversationAnalysis | null;
    typewriterAnimation: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, index, analysis, typewriterAnimation }) => {
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);

    if (analysis) {
        const corrections = analysis.corrections?.filter((c) => c.messageIndex === index);

        if (corrections?.length > 0) {
            const correction = corrections[0];
            return (
                <>
                    <div className="message correction">
                        <TextDiff before={message.content} after={correction.suggestedText} />

                        <div className="correction-icon">
                            <SlTooltip content={"View AI's Explanation"}>
                                <SlIconButton name="info-circle-fill" onClick={() => setShowCorrectionModal(true)} />
                            </SlTooltip>
                        </div>
                    </div>

                    <CorrectionDialog
                        open={showCorrectionModal}
                        onClose={() => setShowCorrectionModal(false)}
                        originalText={message.content}
                        correctedText={correction.suggestedText}
                        explanation={correction.explanation}
                    />
                </>
            );
        }
    }

    return (
        <div className={`message ${message.role}`}>
            <div className="message-content">
                {typewriterAnimation ? <TypewriterEffect text={message.content} /> : message.content}
            </div>
        </div>
    );
};
