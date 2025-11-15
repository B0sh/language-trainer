import React, { useEffect, useState } from "react";
import SlDialog from "@shoelace-style/shoelace/dist/react/dialog/index.js";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlFormatNumber from "@shoelace-style/shoelace/dist/react/format-number/index.js";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { AppSettings } from "../../models/app-settings";
import { NumberChallengeRoundConfig } from "./NumberChallenge";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    open: boolean;
    onClose: () => void;
}

export const CustomSettingsDialog: React.FC<Props> = ({ settings, onSettingsChange, open, onClose }) => {
    const [customMin, setCustomMin] = useState(1);
    const [customMax, setCustomMax] = useState(100);
    const [customMultiplier, setCustomMultiplier] = useState(1);

    useEffect(() => {
        setCustomMin(settings.numberTrainerCustomConfig?.generators[0]?.min ?? 1);
        setCustomMax(settings.numberTrainerCustomConfig?.generators[0]?.max ?? 100);
        setCustomMultiplier(settings.numberTrainerCustomConfig?.generators[0]?.multiplier ?? 1);
    }, [open, settings.numberTrainerCustomConfig]);

    const updateConfig = (min: number, max: number, multiplier: number) => {
        const customConfig: NumberChallengeRoundConfig = {
            label: "Custom",
            helpText: `Generates numbers from ${min} to ${max} × ${multiplier}`,
            generators: [
                {
                    type: "random",
                    weight: 1,
                    min: min,
                    max: max,
                    multiplier: multiplier,
                },
            ],
        };

        onSettingsChange({
            ...settings,
            numberTrainerDifficulty: "custom",
            numberTrainerCustomConfig: customConfig,
        });
    };

    const handleMinChange = (event: Event) => {
        const input = event.target as SlInputElement;
        let value = parseInt(input.value, 10) ?? 0;
        if (value < 1) {
            value = 1;
        } else if (value > customMax) {
            value = customMax;
        }

        setCustomMin(value);
        updateConfig(value, customMax, customMultiplier);
    };

    const handleMaxChange = (event: Event) => {
        const input = event.target as SlInputElement;
        let value = parseInt(input.value, 10) ?? 0;
        if (value < customMin) {
            value = customMin;
        } else if (value > 1000000000) {
            value = 1000000000;
        }

        setCustomMax(value);
        updateConfig(customMin, value, customMultiplier);
    };

    const handleMultiplierChange = (event: Event) => {
        const input = event.target as SlInputElement;
        let value = parseInt(input.value, 10) ?? 0;
        if (value < 1) {
            value = 1;
        } else if (value > 1000000) {
            value = 1000000;
        }
        setCustomMultiplier(value);
        updateConfig(customMin, customMax, value);
    };

    return (
        <SlDialog label="Custom Number Trainer Settings" open={open} onSlAfterHide={onClose}>
            <div style={{ padding: "0.5rem 3rem" }}>
                <div style={{ display: "flex", gap: "var(--sl-spacing-large)", alignItems: "center" }}>
                    <div style={{ width: "45%" }}>
                        <SlInput
                            type="number"
                            value={customMin.toString()}
                            onSlInput={handleMinChange}
                            min="1"
                            max={customMax.toString()}
                        />
                    </div>
                    <div>to</div>
                    <div style={{ width: "45%" }}>
                        <SlInput
                            type="number"
                            value={customMax.toString()}
                            onSlInput={handleMaxChange}
                            min={customMin.toString()}
                            max="1000000000"
                        />
                    </div>
                </div>
                <br />

                <SlInput
                    className="label-on-left"
                    label="Multiplier"
                    type="number"
                    value={customMultiplier.toString()}
                    onSlInput={handleMultiplierChange}
                    min="1"
                    max="1000000"
                />
            </div>
            <div style={{ textAlign: "center" }}>
                <p>
                    <SlFormatNumber value={customMin * customMultiplier} /> to{" "}
                    <SlFormatNumber value={customMax * customMultiplier} />
                </p>
            </div>
            <div slot="footer">
                <SlButton variant="primary" onClick={onClose}>
                    Done
                </SlButton>
            </div>
        </SlDialog>
    );
};
