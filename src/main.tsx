import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { LanguageTrainerApp } from "./ui/LanguageTrainerApp";

import "@shoelace-style/shoelace/dist/themes/dark.css";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "./index.css";

// Set the base path for Shoelace components
setBasePath("/");

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <LanguageTrainerApp />
    </React.StrictMode>
);
