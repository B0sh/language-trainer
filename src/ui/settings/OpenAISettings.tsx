import * as React from "react";
import { AppSettings } from "../../models/app-settings";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js";
import { openUrl } from "../../shared/utility";

interface OpenAISettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const OpenAISettings: React.FC<OpenAISettingsProps> = ({ settings, onSettingsChange }) => {
    const handleConfigChange = (field: string, value: string) => {
        onSettingsChange({
            ...settings,
            configs: {
                ...settings.configs,
                openai: {
                    ...settings.configs.openai,
                    [field]: value,
                },
            },
        });
    };

    return (
        <div>
            <h3>
                OpenAI
                <SlTooltip content="Learn how to get an API key">
                    <SlIconButton
                        name="box-arrow-up-right"
                        onClick={() => openUrl("https://platform.openai.com/account/api-keys")}
                    />
                </SlTooltip>
            </h3>

            <SlInput
                label="API Key"
                type="password"
                align-right
                value={settings.configs.openai.apiKey}
                onSlChange={(e) => handleConfigChange("apiKey", (e.target as HTMLInputElement).value)}
            />
            <SlInput
                label="Organization ID (optional)"
                type="text"
                align-right
                value={settings.configs.openai.organization}
                onSlChange={(e) => handleConfigChange("organization", (e.target as HTMLInputElement).value)}
            />
        </div>
    );
};
