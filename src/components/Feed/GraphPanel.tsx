import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type { CSSProperties } from "react";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import type { Feed } from "../../api/types";
import * as DoDrawer from "../../reducers/drawer";
import DrawerActionButton from "../DrawerUtils/DrawerActionButton";

import { onMaximize, onMinimize } from "../FeedUtils";
import Graph from "../Graph";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {
  isStaff: boolean;
  feed?: Feed;
};

export default (props: Props) => {
  const { isStaff, feed } = props;
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);
  const { graph } = drawer;

  const graphStyle: CSSProperties = {};
  if (!graph.open) {
    graphStyle.display = "none";
  }

  return (
    <Panel
      className="custom-panel"
      order={1}
      defaultSize={53}
      minSize={20}
      style={graphStyle}
    >
      <DrawerActionButton
        onMaximize={() => onMaximize(drawerID, "graph", doDrawer)}
        onMinimize={() => onMinimize(drawerID, doDrawer)}
        isMaximized={drawer.graph.maximized}
      />
      <Graph feed={feed} isStaff={isStaff} />
    </Panel>
  );
};
