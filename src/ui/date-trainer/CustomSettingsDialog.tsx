import React, { useEffect, useState } from "react";
import SlDialog from "@shoelace-style/shoelace/dist/react/dialog/index.js";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlSelect from "@shoelace-style/shoelace/dist/react/select/index.js";
import SlOption from "@shoelace-style/shoelace/dist/react/option/index.js";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { AppSettings } from "../../models/app-settings";
import { DateChallengeRoundConfig, DateChallengeRoundFormat } from "./DateChallenge";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    open: boolean;
    onClose: () => void;
}

const formatOptions = [
    { label: "Full Date (YYYY-MM-DD)", value: "yyyy-mm-dd" },
    { label: "Year and Month (YYYY-MM)", value: "yyyy-mm" },
    { label: "Year Only (YYYY)", value: "yyyy" },
    { label: "Month Only (MM)", value: "mm" },
    { label: "Month and Day (MM-DD)", value: "mm-dd" },
    { label: "Full Date and Time (YYYY-MM-DD HH:mm)", value: "yyyy-mm-dd_hh:mm" },
    { label: "Time Only (HH:mm)", value: "hh:mm" },
];

export const CustomSettingsDialog: React.FC<Props> = ({ settings, onSettingsChange, open, onClose }) => {
    const [customMin, setCustomMin] = useState<string>("");
    const [customMax, setCustomMax] = useState<string>("");
    const [customFormat, setCustomFormat] = useState<DateChallengeRoundFormat>("yyyy-mm-dd");

    useEffect(() => {
        setCustomMin(formatMinMaxDate(settings.dateTrainerCustomConfig?.generators[0]?.min) ?? "");
        setCustomMax(formatMinMaxDate(settings.dateTrainerCustomConfig?.generators[0]?.max) ?? "");

        setCustomFormat(settings.dateTrainerCustomConfig?.generators[0]?.format ?? "yyyy-mm-dd");
    }, [open, settings.dateTrainerCustomConfig]);

    const updateConfig = (min: string, max: string, format: DateChallengeRoundFormat) => {
        if (min === "" || max === "") {
            return;
        }

        const minDate = new Date(min);
        const maxDate = new Date(max);

        if (minDate > maxDate) {
            return;
        }

        const customConfig: DateChallengeRoundConfig = {
            label: "Custom",
            helpText: `Practice dates from ${min} to ${max} in ${format} format`,
            generators: [
                {
                    format: format,
                    weight: 1,
                    min: minDate,
                    max: maxDate,
                },
            ],
        };

        onSettingsChange({
            ...settings,
            dateTrainerDifficulty: "custom",
            dateTrainerCustomConfig: customConfig,
        });
    };

    const handleMinChange = (event: Event) => {
        const input = event.target as SlInputElement;
        setCustomMin(input.value);
        updateConfig(input.value, customMax, customFormat);
    };

    const handleMaxChange = (event: Event) => {
        const input = event.target as SlInputElement;
        setCustomMax(input.value);
        updateConfig(customMin, input.value, customFormat);
    };

    const handleFormatChange = (event: Event) => {
        const select = event.target as HTMLSelectElement;
        const value = select.value.replace("_", " ") as DateChallengeRoundFormat;
        setCustomFormat(value);
        updateConfig(customMin, customMax, value);
    };

    const formatMinMaxDate = (date: Date) => {
        if (date instanceof Date) {
            return date.toISOString().split("T")[0];
        }
        return "";
    };

    const onHide = (event: Event) => {
        if ((event.target as Element).tagName === "SL-DIALOG") {
            onClose();
        }
    };

    return (
        <SlDialog label="Custom Date Trainer Settings" open={open} onSlAfterHide={onHide}>
            <div style={{ padding: "0.5rem 3rem" }}>
                <div style={{ marginBottom: "var(--sl-spacing-medium)" }}>
                    <label>Date Format</label>
                    <SlSelect hoist value={customFormat} onSlChange={handleFormatChange}>
                        {formatOptions.map((option) => (
                            <SlOption key={option.value} value={option.value}>
                                {option.label}
                            </SlOption>
                        ))}
                    </SlSelect>
                </div>
                <div style={{ display: "flex", gap: "var(--sl-spacing-large)", alignItems: "center" }}>
                    <div>
                        <SlInput label="From Date" type="date" value={customMin} onSlInput={handleMinChange} />
                    </div>
                    <div>
                        <SlInput label="To Date" type="date" value={customMax} onSlInput={handleMaxChange} />
                    </div>
                </div>
            </div>
            <div slot="footer">
                <SlButton variant="primary" onClick={onClose}>
                    Done
                </SlButton>
            </div>
        </SlDialog>
    );
};
