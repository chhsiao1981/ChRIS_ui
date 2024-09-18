import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Tooltip,
} from "@patternfly/react-core";
import { Typography } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { elipses } from "../../api/common";
import type { AppDispatch } from "../../store/configureStore";
import type { IDrawerState } from "../../store/drawer/drawerSlice";
import { resetDrawerState } from "../../store/drawer/drawerSlice";
import { clearSelectedFile } from "../../store/explorer/explorerSlice";
import {
  getFeedSuccess,
  resetFeed,
  setShowToolbar,
} from "../../store/feed/feedSlice";
import { useTypedSelector } from "../../store/hooks";
import {
  fetchPluginInstances,
  getSelectedPlugin,
  resetPluginInstances,
} from "../../store/pluginInstance/pluginInstanceSlice";
import { resetActiveResources } from "../../store/resources/resourceSlice";
import type { DestroyActiveResources } from "../../store/resources/types";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/ParentComponent";
import { CodeBranchIcon } from "../Icons";
import NodeDetails from "../NodeDetails/NodeDetails";
import WrapperConnect from "../Wrapper";
import { DrawerActionButton } from "./DrawerUtils";
import { useFetchFeed } from "./useFetchFeed";
import { useSearchQueryParams } from "./usePaginate";
import { handleMaximize, handleMinimize } from "./utilties";
const { Title } = Typography;

const FeedView: React.FC = () => {
  const drawerState = useTypedSelector((state) => state.drawers);
  const { currentLayout } = useTypedSelector((state) => state.feed);
  const dispatch = useDispatch<AppDispatch>();
  const query = useSearchQueryParams();
  const type = query.get("type");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const { selectedPlugin, pluginInstances } = useTypedSelector(
    (state) => state.instance,
  );
  const dataRef = useRef<DestroyActiveResources>();
  dataRef.current = {
    data: pluginInstances.data,
    selectedPlugin,
  };
  const { feed, contextHolder } = useFetchFeed(id, type, isLoggedIn);
  useEffect(() => {
    if (!type || (type === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [type, isLoggedIn, location, navigate]);

  useEffect(() => {
    if (feed) {
      dispatch(getFeedSuccess(feed as Feed));
      dispatch(fetchPluginInstances(feed));
    }
  }, [feed, dispatch]);

  useEffect(() => {
    document.title = "My Analyses - CHRIS UI";
    dispatch(setShowToolbar(true));
    return () => {
      if (dataRef.current?.selectedPlugin && dataRef.current.data) {
        dispatch(resetActiveResources(dataRef.current));
      }
      dispatch(resetPluginInstances());
      dispatch(resetFeed());
      dispatch(clearSelectedFile());
      dispatch(resetDrawerState());
      dispatch(setShowToolbar(false));
    };
  }, [dispatch]);

  const onNodeClick = useCallback(
    (node: any) => {
      dispatch(clearSelectedFile());
      dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  const onNodeBrowserClick = useCallback(
    (node: PluginInstance) => {
      dispatch(clearSelectedFile());
      dispatch(getSelectedPlugin(node));
    },
    [dispatch],
  );

  const handleDrawerAction = useCallback(
    (mode: keyof IDrawerState) => (
      <DrawerActionButton
        content={mode}
        handleMaximize={() => handleMaximize(mode, dispatch)}
        handleMinimize={() => handleMinimize(mode, dispatch)}
        maximized={drawerState[mode].maximized}
      />
    ),
    [drawerState, dispatch],
  );

  const feedTreeAndGraph = (
    <Drawer isInline position="right" isExpanded={drawerState.node.open}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            defaultSize={drawerState.graph.open === false ? "100%" : "47%"}
            isResizable
          >
            {handleDrawerAction("node")}
            <div className="node-block">
              <NodeDetails />
            </div>
          </DrawerPanelContent>
        }
      >
        {handleDrawerAction("graph")}
        <DrawerContentBody>
          {!currentLayout ? (
            <ParentComponent onNodeClick={onNodeClick} />
          ) : (
            <FeedGraph onNodeClick={onNodeClick} />
          )}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

  const TitleComponent = (
    <Title level={4} style={{ marginBottom: 0, color: "white" }}>
      <CodeBranchIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={feed?.data.name}>
        <span>{feed ? elipses(feed?.data.name, 40) : ""}</span>
      </Tooltip>
    </Title>
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      {contextHolder}
      <Drawer
        isInline
        position="bottom"
        isExpanded={drawerState.preview.open || drawerState.files.open}
      >
        <DrawerContent
          panelContent={
            <DrawerPanelContent
              defaultSize={
                !drawerState.graph.open && !drawerState.node.open
                  ? "100vh"
                  : "46vh"
              }
              isResizable
            >
              <FeedOutputBrowser
                explore={true}
                handlePluginSelect={onNodeBrowserClick}
              />
            </DrawerPanelContent>
          }
        >
          {feedTreeAndGraph}
        </DrawerContent>
      </Drawer>
    </WrapperConnect>
  );
};

export default React.memo(FeedView);
