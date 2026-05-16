import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Panel } from "react-resizable-panels";
import * as DoDrawer from "../../reducers/drawer";
import DrawerActionButton from "../DrawerUtils/DrawerActionButton";
import { onMaximize, onMinimize } from "../FeedUtils";
import InstanceDetail from "../InstanceDetail/InstanceDetail";
import styles from "./InstancePanel.module.css";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

export default () => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);

  const { node } = drawer;

  const className = !node.open ? styles.hide : styles["custom-panel"];

  console.info("InstancePanel: className:", className);

  return (
    <Panel className={className} id="2" order={2} defaultSize={47} minSize={20}>
      <DrawerActionButton
        onMaximize={() => onMaximize(drawerID, "node", doDrawer)}
        onMinimize={() => onMinimize(drawerID, doDrawer)}
        isMaximized={drawer.node.maximized}
      />
      <div className="node-block">
        <InstanceDetail />
      </div>
    </Panel>
  );
};
