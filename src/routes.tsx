import {
  genUUID,
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect, useState } from "react";
import { matchPath, useLocation, useRoutes } from "react-router-dom";
import ComputePage from "./components/ComputePage";
import Dashboard from "./components/Dashboard";
import FeedsListView from "./components/Feeds/FeedListView";
import FeedView from "./components/Feeds/FeedView";
import GnomeLibrary from "./components/GnomeLibrary";
import Login from "./components/Login";
import LoginLegacy from "./components/LoginLegacy";
import LoginRedirect from "./components/LoginRedirect";
import { OperationsProvider } from "./components/NewLibrary/context";
import Store from "./components/NewStore";
import NotFound from "./components/NotFound";
import Pacs from "./components/Pacs";
import PipelinePage from "./components/PipelinesPage";
import PluginInstall from "./components/PluginInstall";
import PrivateRoute from "./components/PrivateRoute";
import Signup from "./components/Signup";
import SinglePlugin from "./components/SinglePlugin";
import * as DoCart from "./reducers/cart";
import * as DoDataTag from "./reducers/dataTag";
import * as DoDrawer from "./reducers/drawer";
import * as DoExplorer from "./reducers/explorer";
import * as DoFeed from "./reducers/feed";
import * as DoMainRouter from "./reducers/mainRouter";
import * as DoPlugin from "./reducers/plugin";
import * as DoPluginInstance from "./reducers/pluginInstance";
import * as DoUI from "./reducers/ui";
import * as DoUser from "./reducers/user";

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

// Define the routes and their corresponding sidebar items
const _ROUTE_TO_SIDEBAR_ITEM: Record<string, string> = {
  "/": "overview",
  "library/*": "lib",
  "data/*": "data",
  "data/:id": "data",
  "data/tag/*": "data-tag",
  "data/tag/uploaded": "data-tag-uploaded",
  "data/tag/pacs": "data-tag-pacs",
  "shared/*": "shared",
  new: "new",
  pacs: "pacs",
  login: "login",
  signup: "signup",
  "pipelines/*": "pipeline",
  "pipelines/tag/:tag": "pipeline-tag",
  "pipelines/tag/imported": "pipeline-tag-imported",
  "pipelines/tag/composite": "pipeline-tag-composite",
  "pipeline/*": "pipeline",
  "pipeline/:id": "pipeline",
  import: "import",
  compose: "compose",
  store: "store",
  "install/*": "install",
  "*": "notFound",
};

export default () => {
  const location = useLocation();

  const [uiID, _setUIID] = useState(genUUID);
  const [dataTagID, _setDataTagID] = useState(genUUID);

  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [_classStateUI, doUI] = useUI;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [_classStateUser, doUser] = useUser;

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

  const matchRoute = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    // Exact match first
    if (_ROUTE_TO_SIDEBAR_ITEM[normalizedPath]) {
      return _ROUTE_TO_SIDEBAR_ITEM[normalizedPath];
    }

    // Wildcard match
    for (const routePath of Object.keys(_ROUTE_TO_SIDEBAR_ITEM)) {
      if (matchPath({ path: routePath, end: true }, path)) {
        return _ROUTE_TO_SIDEBAR_ITEM[routePath];
      }
    }

    // Default to notFound if no match
    return _ROUTE_TO_SIDEBAR_ITEM["*"];
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: init only once.
  useEffect(() => {
    // No need to set thunks when doing login.
    if (
      location.pathname.startsWith("/login") ||
      location.pathname === "/signup" ||
      location.pathname === "/oidc-redirect"
    ) {
      return;
    }

    doUI.init(uiID);
    doDataTag.init(dataTagID);
    doUser.init(dataTagID, doDataTag);
    doDrawer.init();
    doExplorer.init();
    doFeed.init();
    doCart.init();
    doPlugin.init();
    doPluginInstance.init();
    doMainRouter.init();
  }, []);

  // Update the active sidebar item based on the current route
  useEffect(() => {
    const currentPath = location.pathname;
    const sidebarItem = matchRoute(currentPath);
    doUI.setSidebarActive(uiID, sidebarItem);
  }, [location.pathname]);

  return useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "library/*",
      element: (
        <PrivateRoute>
          <OperationsProvider>
            <GnomeLibrary />
          </OperationsProvider>
        </PrivateRoute>
      ),
    },
    {
      path: "data/tag/uploaded",
      element: (
        <OperationsProvider>
          <FeedsListView title="Data: uploaded" isShared={false} />
        </OperationsProvider>
      ),
    },
    {
      path: "data/tag/public",
      element: (
        <OperationsProvider>
          <FeedsListView title="Data: public" isShared={true} />
        </OperationsProvider>
      ),
    },
    {
      path: "data/tag/pacs",
      element: (
        <OperationsProvider>
          <FeedsListView title="Data: pacs" isShared={false} />
        </OperationsProvider>
      ),
    },
    {
      path: "data/tag/:id",
      element: (
        <OperationsProvider>
          <FeedsListView title="Data" isShared={false} />
        </OperationsProvider>
      ),
    },
    {
      path: "data/:id",
      element: (
        <OperationsProvider>
          <FeedView />
        </OperationsProvider>
      ),
    },
    {
      path: "data/*",
      element: (
        <OperationsProvider>
          <FeedsListView title="My Data" isShared={false} />
        </OperationsProvider>
      ),
    },
    {
      path: "shared/*",
      element: (
        <OperationsProvider>
          <FeedsListView title="Shared Data" isShared={true} />
        </OperationsProvider>
      ),
    },
    {
      path: "pipeline/:id",
      element: <SinglePlugin />,
    },
    {
      path: "pacs",
      element: (
        <PrivateRoute>
          <Pacs />
        </PrivateRoute>
      ),
    },
    {
      path: "oidc-redirect",
      element: <LoginRedirect />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "login-legacy",
      element: <LoginLegacy />,
    },
    {
      path: "signup",
      element: <Signup />,
    },
    {
      path: "pipelines",
      element: <PipelinePage />,
    },
    {
      path: "pipelines/tag/imported",
      element: <PipelinePage />,
    },
    {
      path: "pipelines/tag/composite",
      element: <PipelinePage />,
    },
    {
      path: "pipelines/tag/:id",
      element: <PipelinePage />,
    },
    {
      path: "compute",
      element: <ComputePage />,
    },
    {
      path: "import",
      element: <Store />,
    },
    {
      path: "install/*",
      element: <PluginInstall />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};
