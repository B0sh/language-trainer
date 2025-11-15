import type SlSwitchElement from "@shoelace-style/shoelace/dist/components/switch/switch";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import SlRadioButton from "@shoelace-style/shoelace/dist/react/radio-button/index.js";
import SlRadioGroup from "@shoelace-style/shoelace/dist/react/radio-group/index.js";
import SlSwitch from "@shoelace-style/shoelace/dist/react/switch/index.js";
import React, { useState } from "react";
import { AppSettings } from "../../models/app-settings";
import { getTargetLanguage } from "../../shared/languages";
import { DATE_CHALLENGE_DEFAULT_DIFFICULTY } from "./DateChallengeDefaults";
import { CustomSettingsDialog } from "./CustomSettingsDialog";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    onStart: () => void;
}

export const DateTrainerMenu: React.FC<Props> = ({ settings, onStart, onSettingsChange }) => {
    const [difficulty, setDifficulty] = useState(settings.dateTrainerDifficulty);
    const [showCustomSettings, setShowCustomSettings] = useState(false);
    const language = getTargetLanguage(settings.targetLanguage);

    const handleDifficultyChange = (value: string) => {
        setDifficulty(value);
        onSettingsChange({ ...settings, dateTrainerDifficulty: value });
    };

    const handleGenSentenceChange = (value: boolean) => {
        onSettingsChange({ ...settings, dateTrainerGenSentence: value });
    };

    if (!language) {
        throw new Error(
            "You do not have a target language set!\n\nPlease select a target language in the settings panel."
        );
    }

    const selectedDifficulty = DATE_CHALLENGE_DEFAULT_DIFFICULTY.find((c) => c.label === difficulty);

    return (
        <>
            <div>
                Test your ability to hear dates in your target language!
                <br />
                <br />
                AI will speak some random dates in {language.description}, and then you have to type them.{" "}
                <i>Just for fun!</i>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <SlRadioGroup
                            style={{ display: "inline-block" }}
                            helpText={selectedDifficulty?.helpText}
                            value={difficulty}
                            onSlChange={(e) => handleDifficultyChange((e.target as HTMLInputElement).value)}
                        >
                            {DATE_CHALLENGE_DEFAULT_DIFFICULTY.map((round) => (
                                <SlRadioButton key={round.label} value={round.label}>
                                    {round.label}
                                </SlRadioButton>
                            ))}

                            <SlRadioButton value="custom">Custom</SlRadioButton>
                        </SlRadioGroup>

                        {difficulty === "custom" && (
                            <SlIconButton
                                name="pencil"
                                style={{ fontSize: "1.25rem", margin: "0.5rem" }}
                                onClick={() => setShowCustomSettings(true)}
                            ></SlIconButton>
                        )}
                    </div>
                    <br />

                    <SlSwitch
                        checked={settings.dateTrainerGenSentence}
                        helpText="Generate a sentence containing the date."
                        onSlChange={(e) => handleGenSentenceChange((e.target as SlSwitchElement).checked)}
                    >
                        Sentence Mode
                    </SlSwitch>
                </div>
                <div>
                    <SlButton variant="success" size="large" className="play-button" pill onClick={onStart}>
                        <SlIcon slot="prefix" name="play-fill" />
                        Start!
                    </SlButton>
                </div>
            </div>

            <CustomSettingsDialog
                settings={settings}
                onSettingsChange={onSettingsChange}
                open={showCustomSettings}
                onClose={() => setShowCustomSettings(false)}
            />
        </>
    );
};
