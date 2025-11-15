import React from "react";
import SlDialog from "@shoelace-style/shoelace/dist/react/dialog/index.js";
import { TextDiff } from "../../shared/TextDiff";

interface Props {
    open: boolean;
    onClose: () => void;
    originalText: string;
    correctedText: string;
    explanation: string;
}

export const CorrectionDialog: React.FC<Props> = ({ open, onClose, originalText, correctedText, explanation }) => {
    return (
        <SlDialog label="Correction Details" open={open} onSlAfterHide={onClose}>
            <div className="correction-details">
                <p>
                    <TextDiff before={originalText} after={correctedText} />
                </p>

                <h3>AI Analysis</h3>
                <p>{explanation}</p>
            </div>
        </SlDialog>
    );
};
