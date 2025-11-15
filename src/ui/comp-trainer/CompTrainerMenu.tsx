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

export const CompTrainerMenu: React.FC<Props> = ({ settings, onStart, onSettingsChange }) => {
    const language = getTargetLanguage(settings.targetLanguage);

    if (!language) {
        throw new Error(
            "You do not have a target language set!\n\nPlease select a target language in the settings panel."
        );
    }

    return (
        <>
            <div>
                Practice listening comprehension!
                <br />
                <br />
                AI will speak some random sentences in {language.description}, and you will need to describe what was
                said. The AI will judge your answers. <i>Just for fun!</i>
            </div>

            <SlButton variant="success" size="large" className="play-button" pill onClick={onStart}>
                <SlIcon slot="prefix" name="play-fill" />
                Start!
            </SlButton>
        </>
    );
};
