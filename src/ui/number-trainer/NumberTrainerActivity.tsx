import React, { useCallback, useEffect, useState } from "react";
import { NumberChallenge, NumberChallengeRoundConfig } from "./NumberChallenge";
import { NumberTrainerRound } from "./NumberTrainerRound";
import { TrainerFeedback } from "../shared/Trainer/TrainerFeedback";
import SlFormatNumber from "@shoelace-style/shoelace/dist/react/format-number";
import { AppSettings } from "../../models/app-settings";
import { AIProviderRegistry } from "../../ai/registry";
import { useErrorBoundary } from "react-error-boundary";

interface NumberTrainerActivityProps {
    settings: AppSettings;
    config: NumberChallengeRoundConfig;
    onStop: () => void;
}

export const NumberTrainerActivity: React.FC<NumberTrainerActivityProps> = ({ settings, config, onStop }) => {
    const [challenge] = useState(
        () => new NumberChallenge(config, settings.targetLanguage, settings.numberTrainerGenSentence)
    );
    const [playbackStatus, setPlaybackStatus] = useState<string>("");
    const [, forceUpdate] = useState({});
    const { showBoundary } = useErrorBoundary();

    const handleSubmit = useCallback(
        (userInput: string) => {
            const isCorrect = challenge.checkAnswer(userInput);
            if (isCorrect) {
                challenge.setStatus("correct");
            } else {
                challenge.setStatus("incorrect");
                challenge.playAudio();
            }
            forceUpdate({});
        },
        [challenge]
    );

    const speakNumber = useCallback(async () => {
        setPlaybackStatus("loading");
        if (challenge.loading) return;

        try {
            await challenge.generateSentence();
        } catch (error) {
            const provider = AIProviderRegistry.getActiveProvider("llm");
            showBoundary(`Failed to request LLM with ${provider.name}.\n\n${error.message}`);
            return;
        }

        try {
            await challenge.generateAudio();
            setPlaybackStatus("playing");
            await challenge.playAudio();
            setPlaybackStatus("finished");
        } catch (error) {
            const provider = AIProviderRegistry.getActiveProvider("tts");
            showBoundary(`Failed to perform Text-to-Speech with ${provider.name}.\n\n${error.message}`);
        }
    }, [challenge, showBoundary]);

    useEffect(() => {
        speakNumber();
        return () => {
            challenge.stopAudio();
        };
    }, [challenge, speakNumber]);

    const handleNextRound = useCallback(() => {
        challenge.nextRound();
        speakNumber();
        forceUpdate({});
    }, [challenge]);

    const replayAudio = useCallback(() => {
        challenge.playAudio();
    }, [challenge]);

    return (
        <>
            {challenge.status === "correct" || challenge.status === "incorrect" ? (
                <TrainerFeedback
                    playbackStatus={playbackStatus}
                    statusMessage={
                        <div>
                            The number was{" "}
                            <SlFormatNumber value={challenge.currentNumber} lang={settings.appLanguage} />.
                        </div>
                    }
                    message={challenge.sentenceMode ? challenge.text : null}
                    status={challenge.status}
                    onNextRound={handleNextRound}
                    onReplayAudio={replayAudio}
                />
            ) : (
                <NumberTrainerRound
                    playbackStatus={playbackStatus}
                    status={challenge.status}
                    streak={challenge.streak}
                    onSubmit={handleSubmit}
                />
            )}
        </>
    );
};
