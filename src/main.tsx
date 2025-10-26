import { enableMapSet } from "immer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeContextProvider } from "./components/DarkTheme/useTheme.tsx";
import * as DoDataTag from "./reducers/dataTag";
import * as DoDrawer from "./reducers/drawer";
import * as DoExplorer from "./reducers/explorer";
import * as DoFeed from "./reducers/feed";
import * as DoPacs from "./reducers/pacs";
import * as DoUI from "./reducers/ui";
import * as DoUser from "./reducers/user";
import { setupStore } from "./store/configureStore.ts";

import "@patternfly/react-core/dist/styles/base.css";

import { registerThunk, ThunkContext } from "@chhsiao1981/use-thunk";

import "./main.css";

// @ts-expect-error registerThunk
registerThunk(DoDrawer);
// @ts-expect-error registerThunk
registerThunk(DoDataTag);
// @ts-expect-error registerThunk
registerThunk(DoExplorer);
// @ts-expect-error registerThunk
registerThunk(DoFeed);
// @ts-expect-error registerThunk
registerThunk(DoPacs);
// @ts-expect-error registerThunk
registerThunk(DoUI);
// @ts-expect-error registerThunk
registerThunk(DoUser);

enableMapSet();
const store = setupStore();
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <ThunkContext>
      <ThemeContextProvider>
        <App store={store} />
      </ThemeContextProvider>
    </ThunkContext>
  </StrictMode>,
);
