import React from "react";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js";
import { AnimatedSoundwave } from "./AnimatedSoundwave";

export interface Props {
    playbackStatus: string;
}

export const PlaybackIcon: React.FC<Props> = ({ playbackStatus }: Props) => {
    return (
        <div className="status-icon">
            <SlSpinner
                style={{
                    display: playbackStatus === "loading" ? "block" : "none",
                    fontSize: "2rem",
                }}
            />
            <AnimatedSoundwave
                size="2rem"
                color="var(--sl-color-neutral-600)"
                style={{ display: playbackStatus === "playing" ? "block" : "none" }}
            />
            <SlIcon
                name="check"
                style={{ display: playbackStatus === "finished" ? "block" : "none", fontSize: "2rem" }}
            />
        </div>
    );
};
