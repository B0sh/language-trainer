import React, { useRef } from "react";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { AnimatedSoundwave } from "../shared/AnimatedSoundwave";
import { PlaybackIcon } from "../shared/PlaybackIcon";

interface NumberTrainerRoundProps {
    playbackStatus: string;
    status: string;
    onSubmit: (input: string) => void;
}

export const NumberTrainerRound: React.FC<NumberTrainerRoundProps> = ({ playbackStatus, status, onSubmit }) => {
    const inputRef = useRef<SlInputElement>(null);

    const handleInputChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const value = input.value.replace(/[^\d]/g, "");
        if (value) {
            // if I want to support over 1b, need to figure out an alt solution here
            const number = parseInt(value, 10);
            input.value = number.toLocaleString();
        }
    };

    inputRef.current?.focus();

    return (
        <>
            <div className="number-trainer-input-row">
                <PlaybackIcon playbackStatus={playbackStatus} />

                <SlInput
                    ref={inputRef}
                    pill
                    className="trainer-input"
                    size="large"
                    autoFocus
                    autocomplete="off"
                    autoCorrect="off"
                    maxlength={12}
                    disabled={status === "correct" || status === "incorrect" ? true : false}
                    onKeyDown={(e) =>
                        e.key === "Enter" && onSubmit((e.target as HTMLInputElement).value.replace(/,/g, ""))
                    }
                    onSlInput={handleInputChange}
                />
            </div>
        </>
    );
};
