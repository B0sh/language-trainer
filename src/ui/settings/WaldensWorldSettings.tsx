import * as React from "react";
import { AppSettings } from "../../models/app-settings";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js";
import SlAlert from "@shoelace-style/shoelace/dist/react/alert/index.js";

interface WaldensWorldSettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const WaldensWorldSettings: React.FC<WaldensWorldSettingsProps> = ({ settings, onSettingsChange }) => {
    const handleConfigChange = (field: string, value: string) => {
        onSettingsChange({
            ...settings,
            configs: {
                ...settings.configs,
                waldensworld: {
                    ...settings.configs.waldensworld,
                    [field]: value,
                },
            },
        });
    };

    return (
        <div>
            <h3>
                Walden's World
                <SlTooltip content="Thanks for nothing">
                    <SlIconButton name="info-circle" />
                </SlTooltip>
            </h3><br />

            <SlAlert variant="primary" open>
                <strong>Use Walden's Money</strong><br />
                You can use my API code for Gemini Flash 2.5. If it doesn't work, I ran out of money. Or my code is bad. Either way you didn't pay for this.
            </SlAlert>
        </div>
    );
};
