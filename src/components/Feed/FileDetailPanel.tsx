import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Panel } from "react-resizable-panels";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import DrawerActionButton from "../DrawerUtils/DrawerActionButton";
import { onMaximize, onMinimize } from "../FeedUtils";
import FileDetailView from "../Preview/FileDetailView";
import styles from "./FileDetailPanel.module.css";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;

type Props = {};
export default (_props: Props) => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);
  const {
    preview: { maximized, open, currentlyActive },
  } = drawer;

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, _doExplorer] = useExplorer;
  const explorer = getState(classExplorer) || DoExplorer.defaultState;
  const { selectedFile } = explorer;

  const isHide = !open || currentlyActive !== "preview" || !selectedFile;

  const className = !isHide ? "" : styles.hide;
  console.info("FileDetailPanel: open:", open, "isHide:", isHide);

  return (
    <Panel className={className} order={2} id="5" defaultSize={47} minSize={20}>
      <DrawerActionButton
        onMaximize={() => {
          onMaximize(drawerID, "preview", doDrawer);
        }}
        onMinimize={() => {
          onMinimize(drawerID, doDrawer);
        }}
        isMaximized={maximized}
      />

      <FileDetailView
        selectedFile={selectedFile}
        preview="large"
        isHide={isHide}
      />
    </Panel>
  );
};
