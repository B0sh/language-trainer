import * as React from "react";
import { FallbackProps } from "react-error-boundary";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import "./ErrorFallback.css";

export const ErrorFallback = ({ error }: FallbackProps) => {
    let message = "";
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === "string") {
        message = error;
    } else {
        message = "An unknown error occurred";
    }

    return (
        <div className="error-fallback">
            <SlIcon name="exclamation-triangle" className="error-icon"></SlIcon>
            <h2>Something went wrong</h2>
            <pre className="error-message">{message}</pre>
        </div>
    );
};
