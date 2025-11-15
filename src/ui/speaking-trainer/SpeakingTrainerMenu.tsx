import * as React from "react";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import { AppSettings } from "../../models/app-settings";
import { getTargetLanguage } from "../../shared/languages";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    onStart: () => void;
}

export const SpeakingTrainerMenu: React.FC<Props> = ({ settings, onStart, onSettingsChange }) => {
    const language = getTargetLanguage(settings.targetLanguage);

    if (!language) {
        throw new Error(
            "You do not have a target language set!\n\nPlease select a target language in the settings panel."
        );
    }

    return (
        <>
            <div>
                Have some fake conversation practice!
                <br />
                <br />
                Have a short conversation with the AI in {language.description}. After, the AI will make suggestions on
                your writing style. <i>Remember: do not trust any grammar comments made by the AI!</i>
            </div>

            <SlButton variant="success" size="large" className="play-button" pill onClick={onStart}>
                <SlIcon slot="prefix" name="play-fill" />
                Start!
            </SlButton>
        </>
    );
};
