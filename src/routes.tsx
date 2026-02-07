import {
  genUUID,
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect, useState } from "react";
import {
  matchPath,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
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
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import Signup from "./components/Signup";
import SinglePlugin from "./components/SinglePlugin";
import * as DoCart from "./reducers/cart";
import * as DoDataTag from "./reducers/dataTag";
import * as DoDrawer from "./reducers/drawer";
import * as DoExplorer from "./reducers/explorer";
import * as DoFeed from "./reducers/feed";
import * as DoUI from "./reducers/ui";
import * as DoUser from "./reducers/user";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoDataTag = ThunkModuleToFunc<typeof DoDataTag>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

interface State {
  selectData?: Series;
}

export type Series = any[];

interface Actions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<State, Actions>({
  state: {
    selectData: [] as Series,
  },
});

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
  const [state, setState] = useState(State);
  const [route, setRoute] = useState("");
  const navigate = useNavigate();

  const [uiID, _] = useState(genUUID);
  const [dataTagID, _6] = useState(genUUID);

  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [_2, doUI] = useUI;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, doUser] = useUser;
  const userID = getRootID(classStateUser);
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  console.info("routes: user:", user, "userID:", userID);

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [_3, doDrawer] = useDrawer;

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [_4, doExplorer] = useExplorer;

  const useDataTag = useThunk<DoDataTag.State, TDoDataTag>(DoDataTag);
  const [_7, doDataTag] = useDataTag;

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [_8, doFeed] = useFeed;

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [_9, doCart] = useCart;

  console.info("routes: start: route:", route);

  const actions: Actions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      const type = isLoggedIn ? "private" : "public";
      navigate(
        `/feeds?search=&searchType=&page=${1}&perPage=${14}&type=${type}`,
      );
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    },
  };

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

  useEffect(() => {
    // No need to set thunks when doing login.
    if (location.pathname.startsWith("/login")) {
      return;
    }

    doUI.init(uiID);
    doDataTag.init(dataTagID);
    doUser.init(dataTagID, doDataTag);
    doDrawer.init();
    doExplorer.init();
    doFeed.init();
    doCart.init();
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
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <OperationsProvider>
              <GnomeLibrary />
            </OperationsProvider>
          </RouterProvider>
        </PrivateRoute>
      ),
    },
    {
      path: "data/tag/uploaded",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Data: uploaded" isShared={false} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/tag/public",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Data: public" isShared={true} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/tag/pacs",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Data: pacs" isShared={false} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/tag/:id",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Data" isShared={false} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/:id",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedView />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/*",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="My Data" isShared={false} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "shared/*",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Shared Data" isShared={true} />
          </OperationsProvider>
        </RouterProvider>
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
