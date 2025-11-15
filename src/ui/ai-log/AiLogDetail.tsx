import React from "react";
import { AI_REQUEST_TYPE, AIRequestLog } from "../../ai/db";
import { AppSettings } from "../../models/app-settings";
import SlFormatDate from "@shoelace-style/shoelace/dist/react/format-date/index.js";
import "./AiLogDetail.css";

interface Props {
    log: AIRequestLog;
    settings: AppSettings;
}

export const AiLogDetail: React.FC<Props> = ({ log, settings }) => {
    const formatMetadata = (metadata?: Record<string, unknown>) => {
        if (!metadata) return "N/A";
        try {
            return JSON.stringify(metadata, null, 2);
        } catch {
            return "Unable to parse metadata.";
        }
    };

    const formatContent = (content: string | undefined, type: string) => {
        if (!content) return "N/A";
        try {
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return content;
        }
        return content;
    };

    return (
        <>
            <div className="detail-meta">
                <div className="meta-item">
                    <label>Time:</label>
                    <SlFormatDate
                        date={log.date}
                        lang={settings.targetLanguage}
                        month="long"
                        day="numeric"
                        year="numeric"
                        hour="numeric"
                        minute="numeric"
                        second="numeric"
                        hour-format="12"
                    ></SlFormatDate>
                </div>
                <div className="meta-item">
                    <label>Type:</label>
                    <span>{AI_REQUEST_TYPE[log.requestType]}</span>
                </div>
                <div className="meta-item">
                    <label>Provider:</label>
                    <span>{log.provider}</span>
                </div>
                <div className="meta-item">
                    <label>Status:</label>
                    <span className={`status ${log.response === "success" ? "success" : "error"}`}>
                        {log.response === "success" ? "Success" : "Error"}
                    </span>
                </div>
            </div>

            <div className="detail-content">
                <section>
                    <h3>Input</h3>
                    <pre className="content-box">{formatContent(log.inputText, log.requestType)}</pre>
                </section>

                {log.response !== "success" ? (
                    <section>
                        <h3>Error Response</h3>
                        <pre className="content-box error">{log.response || "N/A"}</pre>
                    </section>
                ) : (
                    <section>
                        <h3>Output</h3>
                        <pre className="content-box">{formatContent(log.outputText, log.requestType)}</pre>
                    </section>
                )}

                <section>
                    <h3>Metadata</h3>
                    <pre className="content-box">{formatMetadata(log.metadata)}</pre>
                </section>
            </div>
        </>
    );
};
