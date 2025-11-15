import React, { useEffect, useState } from "react";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlAlert from "@shoelace-style/shoelace/dist/react/alert/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import { useKeypress } from "../../../shared/useKeypress";

interface Props {
    playbackStatus: string;
    status: string;
    statusMessage: React.ReactNode;
    message: React.ReactNode;
    onReplayAudio: () => void;
    onNextRound: () => void;
}

export const TrainerFeedback: React.FC<Props> = ({
    playbackStatus,
    status,
    statusMessage,
    message,
    onReplayAudio,
    onNextRound,
}) => {
    useKeypress(["Enter", " "], (event) => {
        // Since you use enter to submit too, stop processing if the event is from the input
        const target = event.target;
        if (target && (target as HTMLInputElement).classList?.contains("trainer-input")) {
            return;
        }

        onNextRound();
    });

    // useEffect(() => {
    //     if (status === "correct") {
    //         const timeout: NodeJS.Timeout = setTimeout(() => {
    //             onNextRound();
    //         }, 3000);

    //         return () => clearTimeout(timeout);
    //     }
    // }, []);

    return (
        <div className="feedback-container" style={{ textAlign: "center" }}>
            {status === "correct" ? (
                <SlAlert variant="success" open style={{ textAlign: "left" }}>
                    <SlIcon slot="icon" name="check-circle-fill" />
                    <h3>Correct!</h3>
                    {statusMessage}
                </SlAlert>
            ) : (
                <SlAlert variant="danger" open style={{ textAlign: "left" }}>
                    <SlIcon slot="icon" name="x-circle-fill" />
                    <h3>Incorrect</h3>
                    {statusMessage}
                </SlAlert>
            )}

            {message ? (
                <p>
                    <small>{message}</small>
                </p>
            ) : (
                <br />
            )}

            <SlButton
                variant="neutral"
                onClick={onReplayAudio}
                disabled={playbackStatus === "playing"}
                style={{ marginRight: "1rem" }}
            >
                Replay Audio
            </SlButton>

            <SlButton variant="primary" onClick={onNextRound}>
                Next Round
            </SlButton>

            <p style={{ fontStyle: "italic" }}>
                <small>Press Enter or Space to proceed to the next round.</small>
            </p>
        </div>
    );
};
