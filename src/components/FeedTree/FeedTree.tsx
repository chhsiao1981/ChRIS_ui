import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useMutation } from "@tanstack/react-query";
import { Input, notification, Switch } from "antd";
import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
import { hierarchy, tree } from "d3-hierarchy";
import { type Quadtree, quadtree } from "d3-quadtree";
import { select } from "d3-selection";
import { type D3ZoomEvent, zoom as d3Zoom, type ZoomBehavior } from "d3-zoom";
import { throttle } from "lodash";
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createWorkflow,
  getWorkflowPluginInstances,
} from "../../api/serverApi";
import { getPipelinesByName } from "../../api/serverApi/pipeline";
import type { Feed, ID, PluginInstance } from "../../api/types";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { ThemeContext } from "../DarkTheme/useTheme";
import { RotateLeft, RotateRight } from "../Icons";
import {
  INITIAL_SCALE,
  NODE_SIZE,
  SCALE_EXTENT,
  SEPARATION,
} from "./constants";
import DropdownMenu from "./DropdownMenu";
import { drawLink, drawNode } from "./draw";
import Modals from "./Modals";
import type {
  ContextMenuPosition,
  Orientation,
  OverlayScaleType,
  Transform,
  TreeNodeDatum,
} from "./types";
import useSize from "./useSize";
import { getHitNode, getNodeScreenCoords, isNodeInViewport } from "./utils";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

// topological-sort ids.
// for each id, map to the direct-children ids.

type Props = {
  data: TreeNodeDatum;
  isFeedGraph: boolean;
  setIsFeedGraph: () => void;
  onNodeClick: (node: TreeNodeDatum) => void;
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;
  feed?: Feed;
  isStaff: boolean;
};

export default (props: Props) => {
  const {
    data,
    isFeedGraph,
    setIsFeedGraph,
    onNodeClick,
    addNodeLocally,
    removeNodeLocally,
    feed,
    isStaff,
  } = props;

  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const {
    rootNode,
    tsIds,
    selectedInstance: selectedPlugin,
    statuses,
  } = pluginInstance;

  const { isDarkTheme } = useContext(ThemeContext);

  //overlay scale
  const [isOverlayScaleEnabled, setIsOverlayScaleEnabled] = useState(false);
  const [overlayScaleType, setOverlayScaleType] =
    useState<OverlayScaleType>("time");

  // switch
  const [isToggleLabels, setIsToggleLabels] = useState(false);
  const [isSearchBox, setIsSearchBox] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("vertical");

  const [theTransform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    k: INITIAL_SCALE,
  });
  const [theTree, setTheTree] = useState<Quadtree<
    HierarchyPointNode<TreeNodeDatum>
  > | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitRender, setIsInitRender] = useState(false);
  const theSize = useSize(containerRef);
  const width = theSize?.width;
  const height = theSize?.height;
  const [selectedNode, setContextMenuNode] = useState<TreeNodeDatum | null>(
    null,
  );
  const [dropdownPosition, setContextMenuPosition] =
    useState<ContextMenuPosition>({
      x: 0,
      y: 0,
      visible: false,
    });

  const [api, contextHolder] = notification.useNotification();

  const pipelineMutation = useMutation({
    mutationFn: (nodeToZip: PluginInstance) => fetchPipeline(nodeToZip),
    onSuccess: () => {
      api.success({
        message: "Zipping process started...",
      });
    },
    onError: (error: any) => {
      api.error({
        message: error?.message || "Error running pipeline",
      });
    },
  });

  const fetchPipeline = async (pluginInst: PluginInstance) => {
    const {
      status: status3,
      data: data3,
      errmsg: errmsg3,
    } = await getPipelinesByName("zip v20240311");
    const pipelines = data3?.results || [];
    if (!pipelines || pipelines.length === 0) {
      throw new Error("The zip pipeline is not registered. Contact admin.");
    }
    api.info({
      message: "Preparing to initiate the zipping process...",
    });
    const pipeline = pipelines[0];
    const { id: pipelineId } = pipeline;
    const {
      status,
      data: workflow,
      errmsg,
    } = await createWorkflow(pipelineId, pluginInst.id, []);
    if (!workflow) {
      return;
    }

    const {
      status: status2,
      data,
      errmsg: errmsg2,
    } = await getWorkflowPluginInstances(workflow.id, 0, 1000);
    const instances = data || [];
    if (instances && instances.length > 0) {
      const firstInstance = instances[instances.length - 1];
      doPluginInstance.getSelectedPlugin(pluginInstanceID, firstInstance);
      addNodeLocally(instances);
    }
    return pipelines;
  };

  const d3Data = useMemo(() => {
    if (!data)
      return {
        nodes: [] as HierarchyPointNode<TreeNodeDatum>[],
        links: [] as HierarchyPointLink<TreeNodeDatum>[],
        rootNode: null,
      };
    const d3Tree = tree<TreeNodeDatum>()
      .nodeSize(
        orientation === "horizontal"
          ? [NODE_SIZE.y, NODE_SIZE.x]
          : [NODE_SIZE.x, NODE_SIZE.y],
      )
      .separation((a, b) =>
        a.data.parentId === b.data.parentId
          ? SEPARATION.siblings
          : SEPARATION.nonSiblings,
      );
    const root = hierarchy(data, (d) => d.children);
    const layoutRoot = d3Tree(root);
    const computedNodes = layoutRoot.descendants();
    const computedLinks = layoutRoot.links();

    // Efficiently handle topological links
    const newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];
    if (tsIds && Object.keys(tsIds).length > 0) {
      // Create a map for O(1) lookups
      const nodeMap = new Map<ID, HierarchyPointNode<TreeNodeDatum>>();
      computedNodes.forEach((node) => {
        if (!node.id) {
          return;
        }
        nodeMap.set(node.id, node);
      });

      // Process topological links more efficiently
      for (const [targetIdStr, parentIds] of Object.entries(tsIds)) {
        // biome-ignore lint/correctness/useParseIntRadix: parseInt
        const targetId = Number.parseInt(targetIdStr);
        const targetNode = nodeMap.get(targetId);

        if (targetNode) {
          for (const parentId of parentIds) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode) {
              newLinks.push({
                source: parentNode,
                target: targetNode,
              });
            }
          }
        }
      }
    }

    return {
      rootNode: layoutRoot,
      nodes: computedNodes,
      links: [...computedLinks, ...newLinks],
    };
  }, [data, tsIds, orientation]);

  useEffect(() => {
    if (!d3Data.nodes || d3Data.nodes.length === 0) return;
    const newTree = quadtree<HierarchyPointNode<TreeNodeDatum>>()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(d3Data.nodes);
    setTheTree(newTree);
  }, [d3Data.nodes]);

  useLayoutEffect(() => {
    if (isInitRender) {
      return;
    }
    if (!d3Data.rootNode) {
      return;
    }
    if (!width) {
      return;
    }
    if (!height) {
      return;
    }

    const root = d3Data.rootNode;
    const centerX = width / 2 - root.x;
    const centerY = height / 7 - root.y;
    setTransform({ x: centerX, y: centerY, k: INITIAL_SCALE });
    setIsInitRender(true);
  }, [d3Data.rootNode, width, height, isInitRender]);

  useEffect(() => {
    if (!canvasRef.current || !d3Data.rootNode || !width || !height) return;
    const handleZoom = throttle(
      (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      },
      50,
    );
    const zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> = d3Zoom<
      HTMLCanvasElement,
      unknown
    >()
      .scaleExtent([SCALE_EXTENT.min, SCALE_EXTENT.max])
      .on("zoom", handleZoom);
    const selection = select(canvasRef.current).call(zoomBehavior);
    return () => {
      selection.on(".zoom", null);
    };
  }, [d3Data.rootNode, width, height]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(ratio, ratio);
    ctx.translate(theTransform.x, theTransform.y);
    ctx.scale(theTransform.k, theTransform.k);

    // Determine visible nodes to avoid drawing offscreen elements
    const isLargeTree = d3Data.nodes.length > 200;

    // For small trees, render everything
    // For large trees, only render what's visible
    const visibleNodes = isLargeTree
      ? d3Data.nodes.filter((node) =>
          isNodeInViewport(node, theTransform, width, height),
        )
      : d3Data.nodes;

    // For links, either render all or only those connected to visible nodes
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.data.id));
    const visibleLinks = isLargeTree
      ? d3Data.links.filter(
          (link) =>
            visibleNodeIds.has(link.source.data.id) ||
            visibleNodeIds.has(link.target.data.id),
        )
      : d3Data.links;

    // Batch similar drawing operations for better performance
    // 1. Draw all links first (fewer state changes)
    visibleLinks.map((link) => drawLink(ctx, link, isDarkTheme));

    // 2. Draw all nodes (bulk operation)
    visibleNodes.forEach((node) => {
      const nodeId = node.data.item.id;
      const polledStatus = statuses[nodeId];
      const finalStatus = polledStatus || node.data.item.status;
      drawNode({
        ctx,
        node,
        isDarkTheme,
        toggleLabel: isToggleLabels,
        searchFilter: searchFilter,
        overlayScale: isOverlayScaleEnabled ? overlayScaleType : undefined,
        selectedId: selectedPlugin?.id,
        finalStatus,
      });
    });

    ctx.restore();
  }, [
    width,
    height,
    d3Data.nodes,
    d3Data.links,
    theTransform,
    isDarkTheme,
    statuses,
    selectedPlugin,
  ]);

  const onCanvasClick = (evt: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (!theTree) return;

    const theHit = getHitNode(evt, canvasRef.current, theTree, theTransform);
    if (!theHit) return;

    onNodeClick(theHit.data);
  };

  const onCanvasContextMenu = (evt: MouseEvent<HTMLCanvasElement>) => {
    evt.preventDefault();
    if (!canvasRef.current || !theTree) return;
    const hit = getHitNode(evt, canvasRef.current, theTree, theTransform);

    if (!hit) {
      closeDropdown();
      return;
    }
    const { screenX, screenY } = getNodeScreenCoords(
      hit.x,
      hit.y,
      theTransform,
      containerRef.current!.getBoundingClientRect(),
    );
    setContextMenuNode(hit.data);
    setContextMenuPosition({
      x: screenX + 20,
      y: screenY + 10,
      visible: true,
    });
  };

  const closeDropdown = () => {
    setContextMenuPosition({ x: 0, y: 0, visible: false });
    setContextMenuNode(null);
  };

  // styles
  const styleOverlayScale: CSSProperties = {};
  if (!isOverlayScaleEnabled) {
    styleOverlayScale.display = "none";
  }
  const styleSearchBox: CSSProperties = {
    width: "120px",
  };
  if (!isSearchBox) {
    styleSearchBox.display = "none";
  }
  const styleDropdown: CSSProperties = {
    position: "absolute",
    top: dropdownPosition.y,
    left: dropdownPosition.x,
    zIndex: 999,
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {contextHolder}

      {/* biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave div. */}
      <div style={styleDropdown} onMouseLeave={closeDropdown}>
        <DropdownMenu
          node={selectedNode}
          close={closeDropdown}
          isVisible={dropdownPosition.visible}
        />
      </div>
      <div
        className="feed-tree__controls"
        style={{ display: "flex", gap: 10, margin: 10 }}
      >
        <div>
          {orientation === "vertical" ? (
            <RotateLeft
              onClick={() => setOrientation("horizontal")}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <RotateRight
              onClick={() => setOrientation("vertical")}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <Switch
          checked={isToggleLabels}
          onChange={() => setIsToggleLabels(!isToggleLabels)}
          checkedChildren="Labels On"
          unCheckedChildren="Labels Off"
        />
        <Switch
          checked={isFeedGraph}
          onChange={() => setIsFeedGraph()}
          checkedChildren="3D"
          unCheckedChildren="2D"
        />
        <Switch
          checked={isOverlayScaleEnabled}
          onChange={() => setIsOverlayScaleEnabled(!isOverlayScaleEnabled)}
          checkedChildren="Node Scale On"
          unCheckedChildren="Node Scale Off"
        />
        <select
          value={overlayScaleType}
          onChange={(e) =>
            setOverlayScaleType(e.target.value as OverlayScaleType)
          }
          style={styleOverlayScale}
        >
          <option value="time">Time</option>
          <option value="cpu">CPU</option>
          <option value="memory">Memory</option>
        </select>
        <Switch
          checked={isSearchBox}
          onChange={() => setIsSearchBox(!isSearchBox)}
          checkedChildren="Search On"
          unCheckedChildren="Search Off"
        />
        <Input
          placeholder="Search..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={styleSearchBox}
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "grab" }}
        onClick={onCanvasClick}
        onContextMenu={onCanvasContextMenu}
      />
      <Modals
        feed={feed}
        addNodeLocally={addNodeLocally}
        removeNodeLocally={removeNodeLocally}
        isStaff={isStaff}
      />
    </div>
  );
};
