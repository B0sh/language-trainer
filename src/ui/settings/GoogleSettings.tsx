import * as React from "react";
import { AppSettings } from "../../models/app-settings";
import SlInput from "@shoelace-style/shoelace/dist/react/input/index.js";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js";
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js";
import SlAlert from "@shoelace-style/shoelace/dist/react/alert/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import SlSelect from "@shoelace-style/shoelace/dist/react/select/index.js";
import SlOption from "@shoelace-style/shoelace/dist/react/option/index.js";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import { openUrl } from "../../shared/utility";
import googleVoicesData from "../../ai/google/google-voices.json";
import { AIProviderRegistry } from "../../ai/registry";
import { getTargetLanguage } from "../../shared/languages";

interface GoogleSettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const GoogleSettings: React.FC<GoogleSettingsProps> = ({ settings, onSettingsChange }) => {
    const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);

    const handleConfigChange = (field: string, value: string) => {
        onSettingsChange({
            ...settings,
            configs: {
                ...settings.configs,
                google: {
                    ...settings.configs.google,
                    [field]: value.trim(),
                },
            },
        });
    };

    const previewVoice = async () => {
        const language = getTargetLanguage(settings.targetLanguage);
        if (!language || !settings.configs.google?.apiKey || !settings.configs.google?.voice) return;

        setIsPreviewPlaying(true);
        try {
            const ttsAudio = await AIProviderRegistry.textToSpeech({
                text: language.ttsPreview,
                language: language.id,
            });
            if (ttsAudio) {
                await ttsAudio.play(settings.volume);
            }
        } finally {
            setIsPreviewPlaying(false);
        }
    };

    return (
        <div>
            <h3>
                Google
                <SlTooltip content="Learn how to get an API key">
                    <SlIconButton
                        name="box-arrow-up-right"
                        onClick={() => openUrl("https://support.google.com/googleapi/answer/6158862?hl=en")}
                    />
                </SlTooltip>
            </h3>

            <SlInput
                label="API Key"
                type="password"
                align-right
                value={settings.configs.google?.apiKey}
                onSlChange={(e) => handleConfigChange("apiKey", (e.target as HTMLInputElement).value)}
            />

            {settings.tts === "google" && (
                <>
                    <div style={{ marginTop: "1rem" }}>
                        <SlSelect
                            label="Voice"
                            align-right
                            value={settings.configs.google?.voice || ""}
                            onSlChange={(e) => handleConfigChange("voice", (e.target as HTMLSelectElement).value)}
                        >
                            {googleVoicesData.voices
                                .filter((voice) => voice.languageCodes.includes(settings.targetLanguage))
                                .map((voice) => (
                                    <SlOption key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.ssmlGender})
                                    </SlOption>
                                ))}
                        </SlSelect>
                    </div>
                    <div style={{ marginTop: "1rem", textAlign: "right" }}>
                        {settings.configs.google?.voice && (
                            <SlButton
                                onClick={previewVoice}
                                disabled={!settings.configs.google?.apiKey || isPreviewPlaying}
                            >
                                <SlIcon slot="prefix" name={isPreviewPlaying ? "arrow-repeat" : "play-fill"} />
                                {isPreviewPlaying ? "Playing..." : "Preview Voice"}
                            </SlButton>
                        )}
                    </div>
                </>
            )}

            <br />

            <SlAlert open>
                <SlIcon slot="icon" name="info-circle" />
                <strong>The Google API key requires the following permissions:</strong>
                <ul>
                    <li>Cloud Text-to-Speech API</li>
                    <li>Cloud Speech-to-Text API</li>
                    <li>Generative Language API</li>
                </ul>
            </SlAlert>
        </div>
    );
};
