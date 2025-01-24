import React, { useRef } from "react";
import SlInput from "@shoelace-style/shoelace/dist/react/input";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { NumberChallengeState } from "./NumberChallenge";

interface NumberTrainerRoundProps {
    targetLanguage: string;
    state: NumberChallengeState;
    onSubmit: (input: string) => void;
}

export const NumberTrainerRound: React.FC<NumberTrainerRoundProps> = ({ targetLanguage, state, onSubmit }) => {
    const inputRef = useRef<SlInputElement>(null);

    const getStatusIcon = () => {
        switch (state.status) {
            case "audio-loading":
                return <SlSpinner style={{ fontSize: "2rem" }} />;
            case "audio-playing":
            case "audio-finished":
                return <SlIcon style={{ fontSize: "2rem" }} name="soundwave" />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="number-trainer-input-row">
                <div className="status-icon">{getStatusIcon()}</div>
                <SlInput
                    ref={inputRef}
                    pill
                    className="number-trainer-input"
                    size="large"
                    autoFocus
                    autocomplete="off"
                    autoCorrect="off"
                    disabled={state.status === "correct" || state.status === "incorrect" ? true : false}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit((e.target as HTMLInputElement).value)}
                />
            </div>

            <div className="stats">
                Your streak is <strong>{state.streak}</strong>.
            </div>
        </>
    );
};
