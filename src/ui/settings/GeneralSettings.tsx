import * as React from "react";
import { AppSettings } from "../../models/app-settings";
import SlRadioGroup from "@shoelace-style/shoelace/dist/react/radio-group/index.js";
import SlRadioButton from "@shoelace-style/shoelace/dist/react/radio-button/index.js";
import SlRange from "@shoelace-style/shoelace/dist/react/range/index.js";
import { APP_LANGUAGES } from "../../shared/languages";

interface GeneralSettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSettingsChange }) => {
    const handleAppLanguageChange = (language: string) => {
        onSettingsChange({
            ...settings,
            appLanguage: language,
        });
    };

    const handleVolumeChange = (volume: number) => {
        if (volume < 0) return;
        if (volume > 100) return;

        onSettingsChange({
            ...settings,
            volume,
        });
    };

    const handleThemeChange = (theme: string) => {
        if (theme === "light" || theme === "dark" || theme === "auto") {
            onSettingsChange({
                ...settings,
                theme,
            });
        }
    };

    return (
        <div>
            <h2>App Settings</h2>
            <SlRadioGroup
                label="App Language"
                name="appLanguage"
                align-right
                value={settings.appLanguage}
                onSlChange={(e) => handleAppLanguageChange((e.target as HTMLInputElement).value)}
            >
                {APP_LANGUAGES.map((lang) => (
                    <SlRadioButton key={lang.id} value={lang.id}>
                        {lang.description}
                    </SlRadioButton>
                ))}
            </SlRadioGroup>

            <SlRadioGroup
                label="Theme"
                name="theme"
                align-right
                value={settings.theme}
                onSlChange={(e) => handleThemeChange((e.target as HTMLInputElement).value)}
            >
                <SlRadioButton value="light">Light</SlRadioButton>
                <SlRadioButton value="dark">Dark</SlRadioButton>
                <SlRadioButton value="auto">Auto</SlRadioButton>
            </SlRadioGroup>

            <SlRange
                label="Volume"
                min={0}
                max={100}
                align-right
                className="volume-range"
                value={settings.volume ?? 50}
                onSlChange={(e) => handleVolumeChange(parseInt((e.target as HTMLInputElement).value))}
            />
        </div>
    );
};
