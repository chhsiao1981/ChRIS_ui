import { Tooltip } from "@patternfly/react-core";
import { type CSSProperties, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";
import { elipses } from "../../api/common";
import type { PluginInstance } from "../../api/types";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/ParentComponent";
import { AnalysisIcon } from "../Icons";
import NodeDetails from "../NodeDetails/NodeDetails";
import Wrapper from "../Wrapper";
import { DrawerActionButton } from "./DrawerUtils";
import usePaginatedTreeQuery from "./usePaginatedTreeQuery";
import "./Feeds.css"; // Import your CSS file
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { collectionJsonToJson } from "../../api/api";
import {
  PluginInstanceStatus,
  type PluginInstance as PluginInstanceType,
} from "../../api/types";
import * as DoCart from "../../reducers/cart";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { Role } from "../../reducers/types";
import * as DoUser from "../../reducers/user";
import CustomTitle from "./CustomTitle";
import { useFetchFeed } from "./useFetchFeed";
import { useSearchQueryParams } from "./usePaginate";
import { usePollAllPluginStatuses } from "./usePolledStatuses";
import { onMaximize, onMinimize } from "./utilties";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { role, isLoggedIn, isInit, isStaff } = user;

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classStateDrawer, doDrawer] = useDrawer;
  const drawerState = getState(classStateDrawer) || DoDrawer.defaultState;
  const drawerID = getRootID(classStateDrawer);

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classStateExplorer, doExplorer] = useExplorer;
  const explorerID = getRootID(classStateExplorer);

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [classStateFeed, doFeed] = useFeed;
  const feedID = getRootID(classStateFeed);

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classStatePluginInstance, doPluginInstance] = usePluginInstance;
  const pluginInstanceID = getRootID(classStatePluginInstance);

  const [currentLayout, setCurrentLayout] = useState(false);
  const query = useSearchQueryParams();
  const theType = query.get("type");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;

  const { feed, contextHolder } = useFetchFeed(id, theType, isLoggedIn, isInit);
  const treeQuery = usePaginatedTreeQuery(feed);
  const statuses = usePollAllPluginStatuses(
    treeQuery.pluginInstances,
    treeQuery.totalCount,
  );

  useEffect(() => {
    if (!isInit) {
      return;
    }

    if (!theType || (theType === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [theType, isLoggedIn, isInit, location, navigate]);

  // init
  useEffect(() => {
    document.title = "My Analyses - CHRIS UI";
    doFeed.setShowToolbar(feedID, true);
    return () => {
      doPluginInstance.resetSelectedPlugin(pluginInstanceID);
      doExplorer.clearSelectedFile(explorerID);
      doFeed.setShowToolbar(feedID, false);
    };
  }, [isInit]);

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
    ) as PluginInstanceType;

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
    if (!feed) {
      return;
    }
    doFeed.feedSuccess(feedID, feed);
  }, [feed]);

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
    setCurrentLayout(!currentLayout);
  };

  const TitleComponent = (
    <CustomTitle color="white">
      <AnalysisIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={feed?.name}>
        <span>{feed ? elipses(feed?.name, 40) : ""}</span>
      </Tooltip>
    </CustomTitle>
  );

  const isUpperShow = drawerState.graph.open || drawerState.node.open;
  const upperStyle: CSSProperties = {};
  if (!isUpperShow) {
    upperStyle.display = "none";
  }

  const graphStyle: CSSProperties = {};
  if (!drawerState.graph.open) {
    graphStyle.display = "none";
  }

  const nodeStyle: CSSProperties = {
    overflow: "scroll",
  };
  if (!drawerState.node.open) {
    nodeStyle.display = "none";
  }

  const feedOutputBrowserStyle: CSSProperties = {};
  if (!drawerState.files.open && !drawerState.preview.open) {
    feedOutputBrowserStyle.display = "none";
  }

  return (
    <Wrapper title={TitleComponent}>
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
                    maximized={drawerState.graph.maximized}
                  />
                  {!currentLayout ? (
                    <ParentComponent
                      changeLayout={changeLayout}
                      currentLayout={currentLayout}
                      treeQuery={treeQuery}
                      statuses={statuses}
                      feed={feed}
                      isStaff={isStaff}
                    />
                  ) : (
                    <FeedGraph
                      currentLayout={currentLayout}
                      changeLayout={changeLayout}
                      onNodeClick={onNodeClick}
                      feed={feed}
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
                  maximized={drawerState.node.maximized}
                />
                <div className="node-block">
                  <NodeDetails useDrawer={useDrawer} useFeed={useFeed} />
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
