import React, { useRef, useState, useEffect } from "react";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { useKeypress } from "../../shared/useKeypress";
import { DateChallengeRound } from "./DateChallenge";
import { AppSettings } from "../../models/app-settings";
import { PlaybackIcon } from "../shared/PlaybackIcon";

interface DateTrainerRoundProps {
    playbackStatus: string;
    settings: AppSettings;
    round: DateChallengeRound;
    onSubmit: (input: string) => void;
}

export const DateTrainerRound: React.FC<DateTrainerRoundProps> = ({ playbackStatus, settings, round, onSubmit }) => {
    const inputRef = useRef<SlInputElement>(null);
    const inputRef2 = useRef<SlInputElement>(null);

    useKeypress(["Enter", " "], (event) => {
        let input = inputRef.current?.value ?? "";
        if (round.format === "mm-dd" || round.format === "yyyy-mm") {
            input = inputRef.current?.value + "-" + inputRef2.current?.value;
        }

        onSubmit(input);
    });

    useEffect(() => {
        if (inputRef.current) {
            // the SLInput's internal input element is not loaded yet, so wait until it renders
            // I would like a better solution here
            setTimeout(() => {
                inputRef.current?.focus();
            });
        }
    }, [inputRef]);

    return (
        <>
            <div className="number-trainer-input-row">
                <PlaybackIcon playbackStatus={playbackStatus} />
                {round.format === "yyyy" && (
                    <SlInput
                        ref={inputRef}
                        pill
                        type="text"
                        autoFocus={true}
                        maxlength={4}
                        className="trainer-input input-yyyy"
                        size="large"
                        lang={settings.targetLanguage}
                    />
                )}
                {round.format === "yyyy-mm-dd" && (
                    <SlInput
                        ref={inputRef}
                        pill
                        autoFocus={true}
                        type="date"
                        className="trainer-input input-yyyy-mm-dd"
                        size="large"
                        lang={settings.targetLanguage}
                    />
                )}
                {round.format === "yyyy-mm" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <SlInput
                            ref={inputRef}
                            pill
                            type="number"
                            maxlength={4}
                            placeholder="Year"
                            className="trainer-input input-yyyy"
                            size="large"
                        />
                        <SlInput
                            ref={inputRef2}
                            pill
                            type="number"
                            min="1"
                            max="12"
                            maxlength={2}
                            placeholder="Month"
                            className="trainer-input input-mm"
                            size="large"
                        />
                    </div>
                )}
                {round.format === "mm" && (
                    <SlInput
                        ref={inputRef}
                        pill
                        type="number"
                        min="1"
                        max="12"
                        maxlength={2}
                        placeholder="Month"
                        className="trainer-input input-mm"
                        size="large"
                    />
                )}

                {round.format === "mm-dd" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <SlInput
                            ref={inputRef}
                            pill
                            type="number"
                            min="1"
                            max="12"
                            maxlength={2}
                            placeholder="Month"
                            className="trainer-input input-mm"
                            size="large"
                        />
                        <SlInput
                            ref={inputRef2}
                            pill
                            type="number"
                            min="1"
                            max="31"
                            maxlength={2}
                            placeholder="Day"
                            className="trainer-input input-dd"
                            size="large"
                        />
                    </div>
                )}
                {round.format === "yyyy-mm-dd hh:mm" && (
                    <SlInput
                        ref={inputRef}
                        pill
                        type="datetime-local"
                        className="trainer-input"
                        size="large"
                        lang={settings.targetLanguage}
                    />
                )}
                {round.format === "hh:mm" && (
                    <SlInput
                        ref={inputRef}
                        pill
                        type="time"
                        className="trainer-input"
                        size="large"
                        lang={settings.targetLanguage}
                    />
                )}
            </div>
        </>
    );
};
