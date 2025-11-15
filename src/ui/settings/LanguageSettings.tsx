import * as React from "react";
import { AppSettings, TargetLanguageLevel } from "../../models/app-settings";
import SlSelect from "@shoelace-style/shoelace/dist/react/select/index.js";
import SlOption from "@shoelace-style/shoelace/dist/react/option/index.js";
import SlRadioGroup from "@shoelace-style/shoelace/dist/react/radio-group/index.js";
import SlRadioButton from "@shoelace-style/shoelace/dist/react/radio-button/index.js";
import { TARGET_LANGUAGES } from "../../shared/languages";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const LanguageSettings: React.FC<Props> = ({ settings, onSettingsChange }) => {
    const handleTargetLanguageChange = (language: string) => {
        onSettingsChange({
            ...settings,
            targetLanguage: language,
        });
    };

    const handleTargetLanguageLevelChange = (level: string) => {
        onSettingsChange({
            ...settings,
            targetLanguageLevel: level as TargetLanguageLevel,
        });
    };

    return (
        <div>
            <h2>Language Settings</h2>
            <SlSelect
                label="Target Language"
                name="targetLanguage"
                align-right
                value={settings.targetLanguage}
                onSlChange={(e) => handleTargetLanguageChange((e.target as HTMLInputElement).value)}
            >
                {TARGET_LANGUAGES.map((lang) => (
                    <SlOption key={lang.id} value={lang.id}>
                        {lang.emoji} {lang.description}
                    </SlOption>
                ))}
            </SlSelect>

            <SlRadioGroup
                align-right
                label="Target Language Level"
                name="targetLanguageLevel"
                helpText="This is given to the AI to adjust the content generation. If you find advanced to be too difficult, try lowering the language level."
                value={settings.targetLanguageLevel}
                onSlChange={(e) => handleTargetLanguageLevelChange((e.target as HTMLInputElement).value)}
            >
                <SlRadioButton value="low">Beginner</SlRadioButton>
                <SlRadioButton value="medium">Intermediate</SlRadioButton>
                <SlRadioButton value="high">Advanced</SlRadioButton>
            </SlRadioGroup>
        </div>
    );
};
