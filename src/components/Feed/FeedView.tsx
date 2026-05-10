import { type CSSProperties, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";
import type { PluginInstance } from "../../api/types";
import { DrawerActionButton } from "../FeedList/DrawerUtils";
import usePaginatedTreeQuery from "../FeedList/usePaginatedTreeQuery";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/FeedTreeParent";
import NodeDetails from "../NodeDetails/NodeDetails";
import Wrapper from "../Wrapper";
import "../FeedList/Feeds.css"; // Import your CSS file
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { notification } from "antd";
import { collectionJsonToJson } from "../../api/collectionToJson";
import {
  PluginInstanceStatus,
  type PluginInstance as PluginInstanceType,
} from "../../api/types";
import type { FeedType } from "../../api/types/feed";
import { DEFAULT_TYPE } from "../../constants";
import * as DoCart from "../../reducers/cart";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { Role } from "../../reducers/types";
import * as DoUser from "../../reducers/user";
import { useSearchQueryParams } from "../FeedList/usePaginate";
import { usePollAllPluginStatuses } from "../FeedList/usePolledStatuses";
import { onMaximize, onMinimize } from "../FeedList/utilties";
import Title from "./Title";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
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

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classPluginInstance, doPluginInstance] = usePluginInstance;
  const pluginInstanceID = getDefaultID(classPluginInstance);

  const [isFeedGraph, setIsFeeGraph] = useState(false);
  const query = useSearchQueryParams();
  const queryType = query.get("type") as FeedType | null;
  const theType = queryType || DEFAULT_TYPE;

  const params = useParams();
  const { id: paramsFeedID } = params;

  const navigate = useNavigate();
  const location = useLocation();
  const [notificationAPI, contextHolder] = notification.useNotification();

  const treeQuery = usePaginatedTreeQuery(feedData);
  const statuses = usePollAllPluginStatuses(
    treeQuery.pluginInstances,
    treeQuery.totalCount,
  );

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
    if (!isInitUser) {
      return;
    }
    if (!paramsFeedID) {
      return;
    }

    if (feedData && feedData.id === paramsFeedID) {
      return;
    }

    doFeed.setShowToolbar(feedID, true);
    document.title = "My Analyses - CHRIS UI";

    doFeed.getFeedDetail(
      feedID,
      paramsFeedID,
      theType,
      user.username,
      usePluginInstance,
      pluginInstanceID,
    );

    return () => {
      doPluginInstance.resetSelectedPlugin(pluginInstanceID);
      doExplorer.clearSelectedFile(explorerID);
      doFeed.setShowToolbar(feedID, false);
    };
  }, [isInitUser, paramsFeedID, feedData]);

  // set drawer state
  useEffect(() => {
    if (!treeQuery.totalCount) {
      return;
    }
    if (treeQuery.totalCount !== treeQuery.pluginInstances.length) {
      return;
    }

    const lastPluginInstance: PluginInstanceType = collectionJsonToJson(
      treeQuery.pluginInstances[treeQuery.pluginInstances.length - 1],
      false,
      false,
      "FeedView.useEffect",
    );

    const isSuccess =
      lastPluginInstance.status === PluginInstanceStatus.SUCCESS;

    const theRole = role || Role.DefaultRole;
    doDrawer.resetDrawerState(drawerID, theRole, isSuccess);
    return () => {
      const theRole = role || Role.DefaultRole;
      doDrawer.resetDrawerState(drawerID, theRole, isSuccess);
    };
  }, [role, treeQuery.pluginInstances, treeQuery.totalCount]);

  useEffect(() => {
    if (!feedData) {
      return;
    }
    doFeed.feedSuccess(feedID, feedData);
  }, [feedData]);

  const onNodeClick = (node: any) => {
    doExplorer.clearSelectedFile(explorerID);
    doPluginInstance.getSelectedPlugin(pluginInstanceID, node.item);
  };

  const onNodeBrowserClick = (node: PluginInstance) => {
    console.info("onNodeBrowserClick: start: node:", node);
    doExplorer.clearSelectedFile(explorerID);
    doPluginInstance.getSelectedPlugin(pluginInstanceID, node);
  };

  const changeLayout = () => {
    setIsFeeGraph(!isFeedGraph);
  };

  const isUpperShow = drawer.graph.open || drawer.node.open;
  const upperStyle: CSSProperties = {};
  if (!isUpperShow) {
    upperStyle.display = "none";
  }

  const graphStyle: CSSProperties = {};
  if (!drawer.graph.open) {
    graphStyle.display = "none";
  }

  const nodeStyle: CSSProperties = {
    overflow: "scroll",
  };
  if (!drawer.node.open) {
    nodeStyle.display = "none";
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
        <>
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
              <>
                <Panel
                  className="custom-panel"
                  order={1}
                  defaultSize={53}
                  minSize={20}
                  style={graphStyle}
                >
                  <DrawerActionButton
                    content={"graph"}
                    onMaximize={() => onMaximize(drawerID, "graph", doDrawer)}
                    onMinimize={() => onMinimize(drawerID, doDrawer)}
                    maximized={drawer.graph.maximized}
                  />
                  {!isFeedGraph ? (
                    <ParentComponent
                      setIsFeedGraph={changeLayout}
                      isFeedGraph={isFeedGraph}
                      treeQuery={treeQuery}
                      statuses={statuses}
                      feed={feedData}
                      isStaff={isStaff}
                    />
                  ) : (
                    <FeedGraph
                      currentLayout={isFeedGraph}
                      changeLayout={changeLayout}
                      onNodeClick={onNodeClick}
                      feed={feedData}
                    />
                  )}
                </Panel>
                <PanelResizeHandle className="ResizeHandle" />
              </>

              {/* Right Panel: Node Details */}
              <Panel
                className="custom-panel"
                id="2"
                order={2}
                defaultSize={47}
                minSize={20}
                style={nodeStyle}
              >
                <DrawerActionButton
                  content={"node"}
                  onMaximize={() => onMaximize(drawerID, "node", doDrawer)}
                  onMinimize={() => onMinimize(drawerID, doDrawer)}
                  maximized={drawer.node.maximized}
                />
                <div className="node-block">
                  <NodeDetails
                    useDrawer={useDrawer}
                    useFeed={useFeed}
                    usePluginInstance={usePluginInstance}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="ResizeHandleVertical" />
        </>

        {/* Vertical Resize Handle */}

        {/* Bottom Panel: Feed Output Browser */}
        <Panel
          className="custom-panel"
          id="3"
          order={2}
          defaultSize={50}
          minSize={20}
          style={feedOutputBrowserStyle}
        >
          <FeedOutputBrowser
            explore={true}
            handlePluginSelect={onNodeBrowserClick}
            statuses={statuses}
            useUser={useUser}
            useDrawer={useDrawer}
            useExplorer={useExplorer}
            useFeed={useFeed}
            useCart={useCart}
          />
        </Panel>
      </PanelGroup>
    </Wrapper>
  );
};
