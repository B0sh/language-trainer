import { SlButton } from "@shoelace-style/shoelace/dist/react";
import React, { useEffect, useState } from "react";
import { aiRequestDB, AIRequestLog } from "../../ai/db";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js";
import SlBreadcrumb from "@shoelace-style/shoelace/dist/react/breadcrumb/index.js";
import SlBreadcrumbItem from "@shoelace-style/shoelace/dist/react/breadcrumb-item/index.js";
import SlDialog from "@shoelace-style/shoelace/dist/react/dialog/index.js";
import { AppSettings } from "../../models/app-settings";
import { AiLogTable } from "./AiLogTable";
import { AiLogDetail } from "./AiLogDetail";
import "./AiLog.css";
import { useErrorBoundary } from "react-error-boundary";

interface Props {
    settings: AppSettings;
}

export const AiLog: React.FC<Props> = ({ settings }) => {
    const [logs, setLogs] = useState<AIRequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AIRequestLog | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { showBoundary } = useErrorBoundary();

    const fetchLogs = async () => {
        setLoading(true);

        try {
            const results = await aiRequestDB.getRequests();
            setLogs(results);
        } catch (error) {
            console.error(error);
            showBoundary("Could not retrieve AI request logs.");
        } finally {
            setLoading(false);
        }
    };

    const handleWipeLogs = async () => {
        setShowConfirmDialog(false);
        setLoading(true);

        try {
            await aiRequestDB.clearLogs();
            setLogs([]);
        } catch (error) {
            console.error(error);
            showBoundary("Could not wipe AI request logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="ai-log">
            <div className="ai-log-header">
                <SlBreadcrumb>
                    <SlBreadcrumbItem onClick={() => setSelectedLog(null)}>AI Request Logs</SlBreadcrumbItem>
                    {selectedLog && <SlBreadcrumbItem>Details</SlBreadcrumbItem>}
                </SlBreadcrumb>
                {!selectedLog && (
                    <div className="ai-log-actions">
                        <SlButton onClick={fetchLogs} size="small">
                            Refresh
                        </SlButton>
                        <SlButton onClick={() => setShowConfirmDialog(true)} size="small" variant="danger">
                            Wipe Logs
                        </SlButton>
                    </div>
                )}
            </div>

            {loading ? (
                <SlSpinner className="large-spinner"></SlSpinner>
            ) : selectedLog ? (
                <AiLogDetail log={selectedLog} settings={settings} />
            ) : (
                <AiLogTable logs={logs} settings={settings} onSelectLog={setSelectedLog} />
            )}

            <SlDialog label="Confirm" open={showConfirmDialog} onSlAfterHide={() => setShowConfirmDialog(false)}>
                Are you sure you want to clear your AI request logs? This action cannot be undone.
                <div slot="footer" className="ai-log-actions" style={{ float: "right" }}>
                    <SlButton onClick={() => setShowConfirmDialog(false)}>Cancel</SlButton>
                    <SlButton onClick={handleWipeLogs} variant="danger">
                        Clear All Logs
                    </SlButton>
                </div>
            </SlDialog>
        </div>
    );
};
