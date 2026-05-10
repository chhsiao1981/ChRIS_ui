import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { type CSSProperties, useState } from "react";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import * as DoDrawer from "../../reducers/drawer";
import FeedGraph from "../Dashboard/FeedGraph";
import { DrawerActionButton } from "../FeedList/DrawerUtils";
import { onMaximize, onMinimize } from "../FeedList/utilties";
import FeedTreeParent from "../FeedTree/FeedTreeParent";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {};
export default (_props: Props) => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);
  const { graph } = drawer;

  const [isFeedGraph, setIsFeedGraph] = useState(false);

  const changeLayout = () => {
    setIsFeedGraph(!isFeedGraph);
  };

  const graphStyle: CSSProperties = {};
  if (!graph.open) {
    graphStyle.display = "none";
  }

  return (
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
          maximized={graph.maximized}
        />

        <FeedTreeParent
          setIsFeedGraph={changeLayout}
          isFeedGraph={isFeedGraph}
          treeQuery={treeQuery}
          statuses={statuses}
          feed={feedData}
          isStaff={isStaff}
        />
        <FeedGraph
          currentLayout={isFeedGraph}
          changeLayout={changeLayout}
          onNodeClick={onNodeClick}
          feed={feedData}
        />
      </Panel>
      <PanelResizeHandle className="ResizeHandle" />
    </>
  );
};
