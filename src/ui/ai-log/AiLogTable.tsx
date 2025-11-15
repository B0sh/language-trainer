import React from "react";
import { AI_REQUEST_TYPE, AIRequestLog } from "../../ai/db";
import SlRelativeTime from "@shoelace-style/shoelace/dist/react/relative-time/index.js";
import { AppSettings } from "../../models/app-settings";
import "./AiLogTable.css";

interface Props {
    logs: AIRequestLog[];
    settings: AppSettings;
    onSelectLog: (log: AIRequestLog) => void;
}

export const AiLogTable: React.FC<Props> = ({ logs, settings, onSelectLog }) => {
    const formatContent = (content: string | undefined, type: string) => {
        if (!content) return "N/A";
        if (type === "llm_chat") {
            try {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    const lastUserMsg = parsed.reverse().find((msg) => msg.role === "user");
                    return lastUserMsg ? lastUserMsg.content : "N/A";
                } else {
                    return parsed.content || "N/A";
                }
            } catch {
                return content;
            }
        }
        return content;
    };

    return (
        <div className="ai-log-table-container">
            <table className="ai-log-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Provider</th>
                        <th>Input</th>
                        <th>Output</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} onClick={() => onSelectLog(log)} className="clickable-row">
                            <td>
                                <SlRelativeTime date={log.date} lang={settings.targetLanguage}></SlRelativeTime>
                            </td>
                            <td>{AI_REQUEST_TYPE[log.requestType]}</td>
                            <td>{log.provider}</td>
                            <td className="text-cell">{formatContent(log.inputText, log.requestType)}</td>
                            <td className="text-cell">{formatContent(log.outputText, log.requestType)}</td>
                            <td>
                                <span className={`status ${log.response === "success" ? "success" : "error"}`}>
                                    {log.response === "success" ? "Success" : "Error"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
