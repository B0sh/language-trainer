import * as React from "react";
import { createRoot } from "react-dom/client";
import { LanguageTrainerApp } from "./LanguageTrainerApp";

import "@shoelace-style/shoelace/dist/themes/dark.css";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace";

setBasePath("../dist/shoelace");

const root = createRoot(document.body);
root.render(
    <React.StrictMode>
        <LanguageTrainerApp />
    </React.StrictMode>
);
