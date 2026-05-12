import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type { CSSProperties } from "react";
import { Panel } from "react-resizable-panels";
import * as DoDrawer from "../../reducers/drawer";
import DrawerActionButton from "../DrawerUtils/DrawerActionButton";
import { onMaximize, onMinimize } from "../FeedUtils";
import NodeDetails from "../NodeDetails/NodeDetails";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

export default () => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);

  const { node } = drawer;

  const nodeStyle: CSSProperties = {
    overflow: "scroll",
  };
  if (!node.open) {
    nodeStyle.display = "none";
  }

  return (
    <Panel
      className="custom-panel"
      id="2"
      order={2}
      defaultSize={47}
      minSize={20}
      style={nodeStyle}
    >
      <DrawerActionButton
        onMaximize={() => onMaximize(drawerID, "node", doDrawer)}
        onMinimize={() => onMinimize(drawerID, doDrawer)}
        isMaximized={drawer.node.maximized}
      />
      <div className="node-block">
        <NodeDetails />
      </div>
    </Panel>
  );
};
