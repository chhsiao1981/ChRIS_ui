import { enableMapSet } from "immer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeContextProvider } from "./components/DarkTheme/useTheme.tsx";

import "@patternfly/react-core/dist/styles/base.css";

import "./main.css";
import { ThunkContext } from "@chhsiao1981/use-thunk";

enableMapSet();
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <ThunkContext>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </ThunkContext>
  </StrictMode>,
);
