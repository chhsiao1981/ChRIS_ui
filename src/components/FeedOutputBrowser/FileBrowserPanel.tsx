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
import FileBrowser from "./FileBrowser";
import styles from "./FileBrowserPanel.module.css";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {};
export default (_props: Props) => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawerID = getDefaultID(classDrawer);
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const { files } = drawer;
  const { open, maximized } = files;

  const className = open ? `${styles.root} custom-panel` : styles.hide;

  return (
    <Panel className={className} order={1} id="4" defaultSize={53} minSize={20}>
      <DrawerActionButton
        onMaximize={() => {
          onMaximize(drawerID, "files", doDrawer);
        }}
        onMinimize={() => {
          onMinimize(drawerID, doDrawer);
        }}
        isMaximized={maximized}
      />
      <FileBrowser />
    </Panel>
  );
};
