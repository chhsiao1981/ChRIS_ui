import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import config from "config";
import { useContext, useEffect, useState } from "react";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
//@ts-expect-error no use-ackee type definition.
import useAckee from "use-ackee";

import { ThemeContext } from "./components/DarkTheme/useTheme";
import "./components/Feeds/Feeds.css";
import {
  genUUID,
  getState,
  registerThunk,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import Cart from "./components/NewLibrary/components/Cart";
import * as DoCart from "./reducers/cart";
import * as DoDataTag from "./reducers/dataTag";
import * as DoDrawer from "./reducers/drawer";
import * as DoExplorer from "./reducers/explorer";
import * as DoFeed from "./reducers/feed";
import * as DoMainRouter from "./reducers/mainRouter";
import * as DoPacs from "./reducers/pacs";
import * as DoPlugin from "./reducers/plugin";
import * as DoPluginInstance from "./reducers/pluginInstance";
import * as DoSystem from "./reducers/system";
import * as DoUI from "./reducers/ui";
import * as DoUser from "./reducers/user";
import Routes from "./routes";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoDataTag = ThunkModuleToFunc<typeof DoDataTag>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;
type TDoMainRouter = ThunkModuleToFunc<typeof DoMainRouter>;
type TDoPacs = ThunkModuleToFunc<typeof DoPacs>;
type TDoSystem = ThunkModuleToFunc<typeof DoSystem>;

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
// @ts-expect-error registerThunk
registerThunk(DoCart);
// @ts-expect-error registerThunk
registerThunk(DoPlugin);
// @ts-expect-error registerThunk
registerThunk(DoPluginInstance);
// @ts-expect-error registerThunk
registerThunk(DoMainRouter);
// @ts-expect-error registerThunk
registerThunk(DoSystem);

// for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
      networkMode: "always",
      refetchInterval: false,
    },
  },
});

type Props = {};

export default (props: Props) => {
  //
  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [_classStateUI, doUI] = useUI;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, doUser] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;
  console.info("App: isLoggedIn:", isLoggedIn);

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [_classStateDrawer, doDrawer] = useDrawer;

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [_classStateExplorer, doExplorer] = useExplorer;

  const useDataTag = useThunk<DoDataTag.State, TDoDataTag>(DoDataTag);
  const [_classStateDataTag, doDataTag] = useDataTag;

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [_classStateFeed, doFeed] = useFeed;

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [_classStateCart, doCart] = useCart;

  const usePlugin = useThunk<DoPlugin.State, TDoPlugin>(DoPlugin);
  const [_classStatePlugin, doPlugin] = usePlugin;

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [_classStatePluginInstance, doPluginInstance] = usePluginInstance;

  const useMainRouter = useThunk<DoMainRouter.State, TDoMainRouter>(
    DoMainRouter,
  );
  const [_classStateMainRouter, doMainRouter] = useMainRouter;

  const usePacs = useThunk<DoPacs.State, TDoPacs>(DoPacs);
  const [_classStatePacs, doPacs] = usePacs;

  const useSystem = useThunk<DoSystem.State, TDoSystem>(DoSystem);
  const [_classStateSystem, doSystem] = useSystem;
  // required for user
  const [dataTagID, _setDataTagID] = useState(genUUID);

  // theme
  const { isDarkTheme } = useContext(ThemeContext);

  /////
  // ackee
  /////
  const ackeeEnv = {
    server: config.ACKEE_SERVER,
    domainId: config.ACKEE_DOMAIN_ID,
  };

  if (ackeeEnv.server && ackeeEnv.server.length > 0 && ackeeEnv.domainId) {
    // biome-ignore lint/correctness/useHookAtTopLevel: useAckee depends on env, which is immutable.
    useAckee("/", ackeeEnv, {
      detailed: true,
      ignoreLocalhost: true,
      ignoreOwnVisits: true,
    });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: doThunk never changed.
  useEffect(() => {
    // No need to set thunks when doing login / signup.
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/login-legacy" ||
      window.location.pathname === "/signup" ||
      window.location.pathname === "/oidc-redirect"
    ) {
      doSystem.init();
      return;
    }

    doUI.init();
    doDataTag.init(dataTagID);
    doUser.init(dataTagID, doDataTag);
    doDrawer.init();
    doExplorer.init();
    doFeed.init();
    doCart.init();
    doPlugin.init();
    doPluginInstance.init();
    doMainRouter.init();
    doPacs.init();
    doSystem.init();
  }, []);

  // to render
  const themeAlg = isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm;

  const futureRouter = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };

  console.info("App: to render");

  return (
    <CookiesProvider>
      <BrowserRouter future={futureRouter}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            theme={{
              algorithm: themeAlg,
              token: {
                // var(--pf-v5-global--primary-color--200)
                colorSuccess: "#004080",
              },
              components: {
                Progress: {
                  // var(--pf-v5-global--primary-color--100)
                  defaultColor: "#0066CC",
                },
              },
            }}
          >
            <AntdApp>
              <div className="patternfly-font">
                <Cart />
                <Routes />
              </div>
            </AntdApp>
          </ConfigProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </CookiesProvider>
  );
};
