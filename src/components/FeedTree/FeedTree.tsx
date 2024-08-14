import { Alert, Switch, TextInput } from "@patternfly/react-core";
import {
  type HierarchyPointLink,
  type HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import { type Selection, select } from "d3-selection";
import { type ZoomBehavior, zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { isEqual } from "lodash";
import React, { useContext, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setFeedLayout,
  setSearchFilter,
  setTranslate,
} from "../../store/feed/feedSlice";
import type { FeedTreeProp } from "../../store/feed/types";
import { useTypedSelector } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import { RotateLeft, RotateRight } from "../Icons";
import { type FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import Link from "./Link";
import NodeWrapper from "./Node";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import type TreeNodeDatum from "./data";
import type { OwnProps, Point } from "./data";
import useSize from "./useSize";

type FeedTreeState = {
  d3: {
    translate: Point;
    scale: number;
  };
  overlayScale: {
    enabled: boolean;
    type: FeedTreeScaleType;
  };
  collapsible: boolean;
  toggleLabel: boolean;
  search: boolean;
};

function calculateD3Geometry(nextProps: OwnProps, feedTreeProp: FeedTreeProp) {
  let scale: number;
  if (nextProps.zoom > nextProps.scaleExtent.max) {
    scale = nextProps.scaleExtent.max;
  } else if (nextProps.zoom < nextProps.scaleExtent.min) {
    scale = nextProps.scaleExtent.min;
  } else {
    scale = nextProps.zoom;
  }
  return {
    translate: feedTreeProp.translate,
    scale,
  };
}

function getInitialState(
  props: OwnProps,
  feedTreeProp: FeedTreeProp,
): FeedTreeState {
  return {
    d3: calculateD3Geometry(props, feedTreeProp),
    overlayScale: {
      enabled: false,
      type: "time",
    },
    collapsible: false,
    toggleLabel: false,
    search: false,
  };
}

const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";

const FeedTree = (props: OwnProps) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const divRef = useRef<HTMLDivElement>(null);
  const { feedTreeProp, currentLayout, searchFilter } = useTypedSelector(
    (state) => state.feed,
  );
  const [feedTree, setFeedTree] = React.useState<{
    nodes?: HierarchyPointNode<TreeNodeDatum>[];
    links?: HierarchyPointLink<TreeNodeDatum>[];
  }>({
    nodes: [],
    links: [],
  });
  const size = useSize(divRef);
  const { nodeSize, separation, tsIds } = props;
  const { orientation } = feedTreeProp;

  const generateTree = React.useCallback(
    (data: TreeNodeDatum[]) => {
      const d3Tree = tree<TreeNodeDatum>()
        .nodeSize(
          orientation === "horizontal"
            ? [nodeSize.y, nodeSize.x]
            : [nodeSize.x, nodeSize.y],
        )
        .separation((a, b) => {
          return a.data.parentId === b.data.parentId
            ? separation.siblings
            : separation.nonSiblings;
        });

      let nodes: HierarchyPointNode<TreeNodeDatum>[] | undefined = undefined;
      let links: HierarchyPointLink<TreeNodeDatum>[] | undefined = undefined;
      let newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

      if (data) {
        const rootNode = d3Tree(
          hierarchy(data[0], (d) => (d.__rd3t.collapsed ? null : d.children)),
        );
        nodes = rootNode.descendants();
        links = rootNode.links();

        const newLinksToAdd: HierarchyPointLink<TreeNodeDatum>[] = [];

        if (tsIds && Object.keys(tsIds).length > 0) {
          for (const link of links) {
            const targetId = link.target.data.id;
            const sourceId = link.source.data.id;

            // Check if targetId and sourceId exist and if at least one of them is in 'tsIds'
            if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
              // 'tsPlugin' found

              let topologicalLink:
                | HierarchyPointNode<TreeNodeDatum>
                | undefined;

              if (tsIds[targetId]) {
                topologicalLink = link.target;
              } else {
                topologicalLink = link.source;
              }

              // Check if 'topologicalLink' is defined
              if (topologicalLink.data.id) {
                const parents = tsIds[topologicalLink.data.id];

                // Check if 'parents' is defined and not empty
                if (parents && parents.length > 0) {
                  const dict: {
                    [key: string]: HierarchyPointNode<TreeNodeDatum>;
                  } = {};

                  for (const innerLink of links) {
                    if (innerLink.source && innerLink.target) {
                      for (let i = 0; i < parents.length; i++) {
                        if (
                          innerLink.source.data.id === parents[i] &&
                          !dict[innerLink.source.data.id]
                        ) {
                          dict[innerLink.source.data.id] = innerLink.source;
                        }
                        if (
                          innerLink.target.data.id === parents[i] &&
                          !dict[innerLink.target.data.id]
                        ) {
                          dict[innerLink.target.data.id] = innerLink.target;
                        }
                      }
                    }
                  }

                  for (const key in dict) {
                    if (Object.prototype.hasOwnProperty.call(dict, key)) {
                      newLinksToAdd.push({
                        source: dict[key],
                        target: topologicalLink,
                      });
                    }
                  }
                }
              }
            }
          }
        }

        newLinks = [...links, ...newLinksToAdd];
      }

      return { nodes, newLinks: newLinks };
    },
    [
      nodeSize.x,
      nodeSize.y,
      orientation,
      separation.nonSiblings,
      separation.siblings,
      tsIds,
    ],
  );

  React.useEffect(() => {
    if (size?.width) {
      if (orientation === "vertical") {
        dispatch(setTranslate({ x: size.width / 2, y: 90 }));
      } else {
        dispatch(setTranslate({ x: 180, y: size.height / 3 }));
      }
    }
  }, [size, orientation, dispatch]);

  const [feedState, setFeedState] = React.useState<FeedTreeState>(
    getInitialState(props, feedTreeProp),
  );

  const { scale } = feedState.d3;
  const { changeOrientation, scaleExtent } = props;

  const bindZoomListener = React.useCallback(() => {
    const { translate } = feedTreeProp;
    const svg: Selection<SVGSVGElement, unknown, HTMLElement, any> = select(
      `.${svgClassName}`,
    );
    const g: Selection<SVGGElement, unknown, HTMLElement, any> = select(
      `.${graphClassName}`,
    );

    const zoom: ZoomBehavior<SVGSVGElement, unknown> = d3Zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([scaleExtent.min, scaleExtent.max])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg
      .call(zoom)
      .call(
        zoom.transform,
        zoomIdentity.translate(translate.x, translate.y).scale(scale),
      );
  }, [scale, feedTreeProp]);

  React.useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  React.useEffect(() => {
    if (props.data) {
      const { nodes, newLinks: links } = generateTree(props.data);
      setFeedTree(() => {
        return {
          nodes,
          links,
        };
      });
    }
  }, [props.data, generateTree]);

  const handleChange = (feature: string, data?: any) => {
    if (feature === "scale_enabled") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          enabled: !feedState.overlayScale.enabled,
        },
      });
    } else if (feature === "scale_type") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          type: data,
        },
      });
    } else {
      setFeedState({
        ...feedState,
        [feature]: !feedState[feature],
      });
    }
  };

  const handleNodeClick = (item: any) => {
    props.onNodeClick(item);
  };

  const { nodes, links } = feedTree;

  return (
    <div className="feed-tree setFlex grabbable mode_tree" ref={divRef}>
      <div className="feed-tree__container">
        <div className="feed-tree__container--labels">
          {/* Suppressing this for now as we don't know how which key events to hook for changing orientations */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => {
              changeOrientation(orientation);
            }}
            className="feed-tree__orientation"
          >
            {orientation === "vertical" ? (
              <RotateLeft className="feed-tree__orientation--icon" />
            ) : (
              <RotateRight className="feed-tree__orientation--icon" />
            )}
          </div>

          <div className="feed-tree__control">
            <Switch
              id="labels"
              label="Hide Labels"
              labelOff="Show Labels"
              isChecked={feedState.toggleLabel}
              onChange={() => {
                handleChange("toggleLabel");
              }}
            />
          </div>
          <div className="feed-tree__control">
            <Switch
              id="layout"
              label="Switch Layout"
              labelOff="3D"
              isChecked={currentLayout}
              onChange={() => {
                dispatch(setFeedLayout());
              }}
            />
          </div>

          <div className="feed-tree__control feed-tree__individual-scale">
            <Switch
              id="individual-scale"
              label="Scale Nodes On"
              labelOff="Scale Nodes Off "
              isChecked={feedState.overlayScale.enabled}
              onChange={() => {
                handleChange("scale_enabled");
              }}
            />

            {feedState.overlayScale.enabled && (
              <div className="dropdown-wrap">
                <NodeScaleDropdown
                  selected={feedState.overlayScale.type}
                  onChange={(type) => {
                    handleChange("scale_type", type);
                  }}
                />
              </div>
            )}
          </div>
          <div className="feed-tree__control">
            <Switch
              id="search"
              label="Search On"
              labelOff="Search Off "
              isChecked={feedState.search}
              onChange={() => {
                handleChange("search");
              }}
            />
          </div>

          <div className="feed-tree__control">
            {feedState.search && (
              <TextInput
                value={searchFilter.value}
                onChange={(_event, value: string) => {
                  dispatch(setSearchFilter(value.trim()));
                }}
              />
            )}
          </div>
        </div>
      </div>

      {feedTreeProp.translate.x > 0 && feedTreeProp.translate.y > 0 && (
        // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
        <svg
          focusable="true"
          className={`${svgClassName}`}
          width="100%"
          height="100%"
        >
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${feedTreeProp.translate.x},${feedTreeProp.translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => {
              return (
                <Link
                  orientation={orientation}
                  key={`link${i}`}
                  linkData={linkData}
                  isDarkTheme={isDarkTheme}
                />
              );
            })}

            {nodes?.map(({ data, x, y, parent }) => {
              return (
                <NodeWrapper
                  key={`node + ${data.id}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  onNodeClick={handleNodeClick}
                  orientation={orientation}
                  toggleLabel={feedState.toggleLabel}
                  overlayScale={
                    feedState.overlayScale.enabled
                      ? feedState.overlayScale.type
                      : undefined
                  }
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      )}
    </div>
  );
};

const FeedTreeMemoed = React.memo(
  FeedTree,
  (prevProps: OwnProps, nextProps: OwnProps) => {
    if (
      !isEqual(prevProps.data, nextProps.data) ||
      prevProps.zoom !== nextProps.zoom ||
      prevProps.tsIds !== nextProps.tsIds
    ) {
      return false;
    }
    return true;
  },
);

export default FeedTreeMemoed;

FeedTree.defaultProps = {
  scaleExtent: { min: 0.1, max: 1.5 },
  zoom: 1,
  nodeSize: { x: 120, y: 80 },
};
