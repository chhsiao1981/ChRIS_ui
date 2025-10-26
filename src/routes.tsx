import {
  genUUID,
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
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [_3, doDrawer] = useDrawer;

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [_4, doExplorer] = useExplorer;

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [_5, doFeed] = useExplorer;

  const useDataTag = useThunk<DoDataTag.State, TDoDataTag>(DoDataTag);
  const [_7, doDataTag] = useDataTag;

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
    doUI.init(uiID);
    doDataTag.init(dataTagID);
    doUser.init(dataTagID, doDataTag);
    doDrawer.init();
    doExplorer.init();
    doFeed.init();
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
      element: (
        <Dashboard
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "library/*",
      element: (
        <PrivateRoute useUser={useUser}>
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <OperationsProvider>
              <GnomeLibrary
                useUI={useUI}
                useUser={useUser}
                useDrawer={useDrawer}
                useFeed={useFeed}
              />
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
            <FeedsListView
              title="Data: uploaded"
              isShared={false}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
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
            <FeedsListView
              title="Data: public"
              isShared={true}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
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
            <FeedsListView
              title="Data: pacs"
              isShared={false}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
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
            <FeedsListView
              title="Data"
              isShared={false}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
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
            <FeedView
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useExplorer={useExplorer}
              useFeed={useFeed}
            />
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
            <FeedsListView
              title="My Data"
              isShared={false}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
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
            <FeedsListView
              title="Shared Data"
              isShared={true}
              useUI={useUI}
              useUser={useUser}
              useDrawer={useDrawer}
              useFeed={useFeed}
            />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "pipeline/:id",
      element: (
        <SinglePlugin
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "pacs",
      element: (
        <PrivateRoute useUser={useUser}>
          <Pacs
            useUI={useUI}
            useUser={useUser}
            useDrawer={useDrawer}
            useFeed={useFeed}
          />
        </PrivateRoute>
      ),
    },
    {
      path: "login",
      element: <Login useUser={useUser} />,
    },
    {
      path: "signup",
      element: <Signup useUser={useUser} />,
    },
    {
      path: "pipelines",
      element: (
        <PipelinePage
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "pipelines/tag/imported",
      element: (
        <PipelinePage
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "pipelines/tag/composite",
      element: (
        <PipelinePage
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "pipelines/tag/:id",
      element: (
        <PipelinePage
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "compute",
      element: (
        <ComputePage
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "import",
      element: (
        <Store
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "install/*",
      element: (
        <PluginInstall
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
    {
      path: "*",
      element: (
        <NotFound
          useUI={useUI}
          useUser={useUser}
          useDrawer={useDrawer}
          useFeed={useFeed}
        />
      ),
    },
  ]);
};
