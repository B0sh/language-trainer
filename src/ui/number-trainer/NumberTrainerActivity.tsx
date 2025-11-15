import React, { useCallback, useEffect, useState } from "react";
import { NumberChallenge, NumberChallengeRoundConfig } from "./NumberChallenge";
import { NumberTrainerRound } from "./NumberTrainerRound";
import { TrainerFeedback } from "../shared/Trainer/TrainerFeedback";
import SlFormatNumber from "@shoelace-style/shoelace/dist/react/format-number/index.js";
import { AppSettings } from "../../models/app-settings";
import { AIProviderRegistry } from "../../ai/registry";
import { useErrorBoundary } from "react-error-boundary";

interface NumberTrainerActivityProps {
    settings: AppSettings;
    config: NumberChallengeRoundConfig;
}

export const NumberTrainerActivity: React.FC<NumberTrainerActivityProps> = ({ settings, config }) => {
    const [challenge] = useState(
        () =>
            new NumberChallenge(
                config,
                settings.targetLanguage,
                settings.targetLanguageLevel,
                settings.numberTrainerGenSentence
            )
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
                challenge.playAudio(settings.volume);
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
            await challenge.playAudio(settings.volume);
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
        challenge.playAudio(settings.volume);
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
                <NumberTrainerRound playbackStatus={playbackStatus} status={challenge.status} onSubmit={handleSubmit} />
            )}
        </>
    );
};
