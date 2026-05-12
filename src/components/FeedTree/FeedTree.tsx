import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { notification } from "antd";
import type { HierarchyPointNode } from "d3-hierarchy";
import { type Quadtree, quadtree } from "d3-quadtree";
import { select } from "d3-selection";
import { type D3ZoomEvent, zoom as d3Zoom, type ZoomBehavior } from "d3-zoom";
import { throttle } from "lodash";
import {
  type MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Feed } from "../../api/types";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import type { TreeNodeDatum } from "../../reducers/types";
import { ThemeContext } from "../DarkTheme/useTheme";
import type { Orientation } from "../Graph/types";
import { INITIAL_SCALE, SCALE_EXTENT } from "./constants";
import DropdownMenu from "./DropdownMenu";
import { getD3Data } from "./d3utils/getD3Data";
import { paint } from "./d3utils/paint";
import styles from "./FeedTree.module.css";
import type { D3Data, DropdownPosition, Transform } from "./types";
import useSize from "./useSize";
import { getHitNode, getNodeScreenCoords } from "./utils";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

// topological-sort ids.
// for each id, map to the direct-children ids.

type Props = {
  isHide: boolean;
  isToggleLabel: boolean;
  search: string;
  orientation: Orientation;
  feed?: Feed;
  isStaff: boolean;
};

export default (props: Props) => {
  const { isHide, isToggleLabel, search, orientation } = props;

  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const {
    rootNode,
    tsIDs,
    selectedInstance: selectedPlugin,
    statuses,
  } = pluginInstance;

  const { isDarkTheme } = useContext(ThemeContext);

  // switch
  const [theTransform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    k: INITIAL_SCALE,
  });
  // d3Data
  const [d3Data, setD3Data] = useState<D3Data | null>(null);
  // tree is used for getHitNode
  const [theTree, setTheTree] = useState<Quadtree<
    HierarchyPointNode<TreeNodeDatum>
  > | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theSize = useSize(canvasRef);
  const width = theSize?.width;
  const height = theSize?.height;
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    x: 0,
    y: 0,
  });
  const [isDropdown, setIsDropdown] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!rootNode || !width || !height) {
      return;
    }
    const theD3Data = getD3Data(rootNode, orientation, tsIDs);
    setD3Data(theD3Data);

    const newTree = quadtree<HierarchyPointNode<TreeNodeDatum>>()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(theD3Data.nodes);
    setTheTree(newTree);

    const root = theD3Data.rootNode;
    const centerX = width / 2 - root.x;
    const centerY = height / 7 - root.y;

    const transform = { x: centerX, y: centerY, k: INITIAL_SCALE };
    setTransform(transform);
  }, [rootNode, orientation, tsIDs, width, height]);

  useEffect(() => {
    if (!canvasRef.current || !width || !height || !d3Data) {
      return;
    }

    paint(
      canvasRef.current,
      width,
      height,
      theTransform,
      d3Data,
      statuses,
      isDarkTheme,
      isToggleLabel,
      search,
      selectedPlugin,
    );
  }, [
    d3Data,
    width,
    height,
    theTransform,
    statuses,
    isDarkTheme,
    isToggleLabel,
    search,
    selectedPlugin,
  ]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const onZoom = throttle(
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
      .on("zoom", onZoom);
    const selection = select(canvasRef.current).call(zoomBehavior);
    return () => {
      selection.on(".zoom", null);
    };
  }, [canvasRef.current]);

  const onCanvasClick = (evt: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (!theTree) return;

    const theHit = getHitNode(evt, canvasRef.current, theTree, theTransform);
    if (!theHit) return;

    doPluginInstance.setSelectedInstance(pluginInstanceID, theHit.data.item);
  };

  const onCanvasContextMenu = (evt: MouseEvent<HTMLCanvasElement>) => {
    evt.preventDefault();
    if (!canvasRef.current || !theTree) return;
    const theHit = getHitNode(evt, canvasRef.current, theTree, theTransform);

    if (!theHit) {
      closeDropdown();
      return;
    }
    const { screenX, screenY } = getNodeScreenCoords(
      theHit.x,
      theHit.y,
      theTransform,
      containerRef.current!.getBoundingClientRect(),
    );
    doPluginInstance.setSelectedInstance(pluginInstanceID, theHit.data.item);
    setDropdownPosition({
      x: screenX + 20,
      y: screenY + 10,
    });
    setIsDropdown(true);
  };

  const closeDropdown = () => {
    setIsDropdown(false);
  };

  const className = isHide ? styles.hide : styles.root;

  return (
    <div className={className} ref={containerRef}>
      {contextHolder}

      <canvas
        className={styles.canvas}
        ref={canvasRef}
        onClick={onCanvasClick}
        onContextMenu={onCanvasContextMenu}
      />
      <DropdownMenu
        close={closeDropdown}
        isVisible={isDropdown}
        position={dropdownPosition}
      />
    </div>
  );
};
