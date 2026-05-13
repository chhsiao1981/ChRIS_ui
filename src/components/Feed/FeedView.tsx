import { type CSSProperties, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";
// import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import Wrapper from "../Wrapper";
import "../FeedList/Feeds.css"; // Import your CSS file
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { notification } from "antd";
import { PluginInstanceStatus } from "../../api/types";
import type { FeedType } from "../../api/types/feed";
import { DEFAULT_TYPE } from "../../constants";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { Role } from "../../reducers/types";
import * as DoUser from "../../reducers/user";
import { useSearchQueryParams } from "../FeedList/usePaginate";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import GraphPanel from "./GraphPanel";
import NodePanel from "./NodePanel";
// import NodePanel from "./NodePanel";
import Title from "./Title";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classUser, _] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { role, isLoggedIn, isInit: isInitUser, isStaff } = user;

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [classFeed, doFeed] = useFeed;
  const feedID = getDefaultID(classFeed);
  const feed = getState(classFeed) || DoFeed.defaultState;
  const { data: feedData } = feed;

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classPluginInstance, doPluginInstance] = usePluginInstance;
  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { statuses, pluginInstanceList } = pluginInstance;

  const query = useSearchQueryParams();
  const queryType = query.get("type") as FeedType | null;
  const theType = queryType || DEFAULT_TYPE;

  const params = useParams();
  const { dataID: paramsFeedID } = params;

  const navigate = useNavigate();
  const location = useLocation();
  const [notificationAPI, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!isInitUser) {
      return;
    }

    if (theType === "private" && !isLoggedIn) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [theType, isLoggedIn, isInitUser, location, navigate]);

  // init
  useEffect(() => {
    console.info(
      "FeedView: isInitUser:",
      isInitUser,
      "paramsFeedID:",
      paramsFeedID,
      "feedData:",
      feedData?.id || "",
    );
    if (!isInitUser) {
      return;
    }
    if (!paramsFeedID) {
      return;
    }

    if (feedData && `${feedData.id}` === `${paramsFeedID}`) {
      return;
    }

    doFeed.setShowToolbar(feedID, true);
    document.title = `ChRIS-ui: data-${paramsFeedID}`;

    console.info("FeedView.useEffect: to getFeedDetail");
    doFeed.getFeedDetail(
      feedID,
      paramsFeedID,
      theType,
      usePluginInstance,
      pluginInstanceID,
    );
  }, [isInitUser, paramsFeedID, feedData]);

  // set drawer state
  useEffect(() => {
    if (!pluginInstanceList.count) {
      return;
    }
    if (pluginInstanceList.count !== pluginInstanceList.results.length) {
      return;
    }
    if (!pluginInstanceList.results.length) {
      return;
    }
    const lastPluginInstance =
      pluginInstanceList.results[pluginInstanceList.results.length - 1];

    const isSuccess =
      lastPluginInstance.status === PluginInstanceStatus.SUCCESS;

    const theRole = role || Role.DefaultRole;
    doDrawer.resetDrawerState(drawerID, theRole, isSuccess);
  }, [role, pluginInstanceList.results, pluginInstanceList.count]);

  const isUpperShow = drawer.graph.open || drawer.node.open;
  const upperStyle: CSSProperties = {};
  if (!isUpperShow) {
    upperStyle.display = "none";
  }

  const feedOutputBrowserStyle: CSSProperties = {};
  if (!drawer.files.open && !drawer.preview.open) {
    feedOutputBrowserStyle.display = "none";
  }

  return (
    <Wrapper title={<Title feed={feedData} />}>
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="vertical">
        {/* Top Panels: Graph and Node Details */}
        <Panel
          className="custom-panel"
          id="1"
          order={1}
          defaultSize={50}
          minSize={20}
          style={upperStyle}
        >
          <PanelGroup autoSaveId="conditional" direction="horizontal">
            {/* Left Panel: Graph */}
            <GraphPanel feed={feedData} isStaff={isStaff} />

            {/* Right Panel: Node Details */}
            <NodePanel />
          </PanelGroup>
        </Panel>

        {/* Vertical Resize Handle */}
        <PanelResizeHandle className="ResizeHandleVertical" />

        {/* Bottom Panel: Feed Output Browser */}
        <Panel
          className="custom-panel"
          id="3"
          order={2}
          defaultSize={50}
          minSize={20}
          style={feedOutputBrowserStyle}
        >
          <FeedOutputBrowser statuses={statuses} />
        </Panel>
      </PanelGroup>
    </Wrapper>
  );
};
