// usePaginatedTreeQuery.ts

import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect } from "react";
import type { Feed, ID, PluginInstance } from "../../api/types";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { SpinContainer } from "../Common";
import type { PaginatedTreeQueryReturn } from "../FeedList/usePaginatedTreeQuery";
import type { TreeNodeDatum } from "./data";
import FeedTree from "./FeedTree";
import FeedTree from "./FeedTree";
import Loading from "./Loading";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  setIsFeedGraph: () => void;
  isFeedGraph: boolean;
  treeQuery: PaginatedTreeQueryReturn;
  statuses: Record<ID, string>;
  feed?: Feed;
  isStaff: boolean;
};

export default (props: Props) => {
  const { setIsFeedGraph, isFeedGraph, treeQuery, statuses, feed, isStaff } =
    props;

  const {
    error,
    rootNode,
    addNodeLocally,
    pluginInstances,
    removeNodeLocally,
    tsIds,
    processingProgress,
  } = treeQuery;

  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance: selectedPlugin } = pluginInstance;

  const stableRootNode = rootNode;

  const lastPluginInstance = pluginInstances.reduce(
    (r: PluginInstance | null, x, i) => {
      if (r === null) {
        return x;
      }

      return r.id <= x.id ? x : r;
    },
    null,
  );

  useEffect(() => {
    if (!stableRootNode?.item || selectedPlugin || !lastPluginInstance) {
      return;
    }

    doPluginInstance.getSelectedPlugin(pluginInstanceID, lastPluginInstance);
  }, [stableRootNode, selectedPlugin, lastPluginInstance]);

  const onNodeClick = (node: TreeNodeDatum) => {
    console.info("ParentComponent: onNodeClick: node:", node.item);
    node.item &&
      doPluginInstance.getSelectedPlugin(pluginInstanceID, node.item);
  };

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  // Show loading spinner only when we have no nodes at all

  return (
    <>
      <SpinContainer
        title={`Constructing your feed tree (${processingProgress}% complete)`}
        isHide={!rootNode}
      />
      {/* Full-screen progress overlay */}
      <Loading />
      <FeedTree
        tsIds={tsIds}
        onNodeClick={onNodeClick}
        setIsFeedGraph={setIsFeedGraph}
        isFeedGraph={isFeedGraph}
        addNodeLocally={addNodeLocally}
        pluginInstances={pluginInstances}
        statuses={statuses}
        removeNodeLocally={removeNodeLocally}
        feed={feed}
        isStaff={isStaff}
      />
    </>
  );
};
