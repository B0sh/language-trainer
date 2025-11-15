import * as React from "react";
import { useState, useEffect } from "react";
import { AppSettings } from "../../models/app-settings";
import SlSelect from "@shoelace-style/shoelace/dist/react/select/index.js";
import SlOption from "@shoelace-style/shoelace/dist/react/option/index.js";

interface Props {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

interface Device {
    label: string;
    deviceId: string;
}

export interface MicrophoneSettingsState {
    selectedDeviceId: string;
    devices: Device[];
}

export const MicrophoneSettings: React.FC<Props> = ({ settings, onSettingsChange }) => {
    const [state, setState] = useState<MicrophoneSettingsState>({
        selectedDeviceId: settings.microphoneDeviceId,
        devices: [],
    });

    useEffect(() => {
        const loadDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioDevices = devices
                    .filter((device) => device.kind === "audioinput")
                    .map((device) => {
                        let label = device.label;
                        const labelRegex = /\s\([^)]+\)$/;
                        if (labelRegex.test(label)) {
                            label = label.replace(labelRegex, "");
                        }

                        if (device.deviceId == "default") {
                            label = `Always use default (${label.replace("Default - ", "")})`;
                        }

                        return {
                            label,
                            deviceId: device.deviceId,
                        };
                    });

                setState((prev) => ({
                    ...prev,
                    devices: audioDevices,
                    selectedDeviceId: audioDevices[0]?.deviceId || "",
                }));
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        };

        loadDevices();

        navigator.mediaDevices.addEventListener("devicechange", loadDevices);
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
        };
    }, []);

    const handleDeviceChange = (deviceId: string) => {
        setState((prev) => ({
            ...prev,
            selectedDeviceId: deviceId,
        }));

        onSettingsChange({
            ...settings,
            microphoneDeviceId: deviceId,
        });
    };

    return (
        <div>
            <h2>Voice Settings</h2>
            <SlSelect
                label="Input Device"
                name="microphone"
                align-right
                value={state.selectedDeviceId}
                onSlChange={(e) => handleDeviceChange((e.target as HTMLInputElement).value)}
            >
                {state.devices.map((device) => (
                    <SlOption key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SlOption>
                ))}
            </SlSelect>
        </div>
    );
};
