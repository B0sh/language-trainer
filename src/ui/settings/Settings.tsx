import * as React from "react";
import SlDivider from "@shoelace-style/shoelace/dist/react/divider/index.js";
import { AppSettings } from "../../models/app-settings";
import { GeneralSettings } from "./GeneralSettings";
import { LanguageSettings } from "./LanguageSettings";
import "./Settings.css";
import { MicrophoneSettings } from "./MicrophoneSettings";

interface SettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div
            className="settings-container form-control"
            style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}
        >
            <LanguageSettings settings={settings} onSettingsChange={onSettingsChange} />
            <SlDivider />

            <GeneralSettings settings={settings} onSettingsChange={onSettingsChange} />
            <SlDivider />

            <MicrophoneSettings settings={settings} onSettingsChange={onSettingsChange} />
        </div>
    );
};
