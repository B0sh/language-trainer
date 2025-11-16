import * as React from "react";
import { AppSettings } from "../../models/app-settings";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js";
import { openUrl } from "../../shared/utility";

interface OpenRouterSettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const OpenRouterSettings: React.FC<OpenRouterSettingsProps> = ({ settings, onSettingsChange }) => {
    const handleConfigChange = (field: string, value: string) => {
        onSettingsChange({
            ...settings,
            configs: {
                ...settings.configs,
                openrouter: {
                    ...settings.configs.openrouter,
                    [field]: value,
                },
            },
        });
    };

    return (
        <div>
            <h3>
                OpenRouter
                <SlTooltip content="Learn how to get an API key">
                    <SlIconButton
                        name="box-arrow-up-right"
                        onClick={() => openUrl("https://openrouter.ai/keys")}
                    />
                </SlTooltip>
            </h3>

            <SlInput
                label="API Key"
                type="password"
                align-right
                value={settings.configs.openrouter?.apiKey || ""}
                onSlChange={(e) => handleConfigChange("apiKey", (e.target as HTMLInputElement).value)}
            />
            <SlInput
                label="Model"
                type="text"
                align-right
                placeholder="e.g. google/gemini-2.5-flash"
                value={settings.configs.openrouter?.model || ""}
                onSlChange={(e) => handleConfigChange("model", (e.target as HTMLInputElement).value)}
            />
        </div>
    );
};
