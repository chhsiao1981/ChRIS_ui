import { Alert } from "../Antd";
import "./FeedOutputBrowser.css";
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect } from "react";
import * as DoExplorer from "../../reducers/explorer";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { EmptyStateLoader } from "./EmptyStateLoader";
import styles from "./FeedOutputBrowser.module.css";
import FetchFilesLoader from "./FetchFilesLoader";
import FileBrowserPanelGroup from "./FileBrowserPanelGroup";

type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

export default () => {
  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);
  const explorer = getState(classExplorer) || DoExplorer.defaultState;
  const { error } = explorer;
  const isError = !!error;

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classPluginInstance, _doPluginInstance] = usePluginInstance;
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance, statuses } = pluginInstance;
  const status =
    statuses[selectedInstance?.id || ""] || selectedInstance?.status || "";
  const isFinished =
    status === "finishedSuccessfully" ||
    status === "finishedWithError" ||
    status === "cancelled";

  const isHideFetchFilesLoader = isFinished;
  const isHideFileBrowser = !isFinished || isError;
  const isHideError = !isFinished || !isError;
  const isHideEmptyStateLoader =
    !isHideFetchFilesLoader || !isHideFileBrowser || !isHideError;

  useEffect(() => {
    if (!selectedInstance) {
      return;
    }
  }, [selectedInstance]);

  return (
    <div className={styles.root}>
      <FetchFilesLoader
        title="Plugin executing. Files will be fetched when plugin completes"
        isHide={isHideFetchFilesLoader}
      />
      <FileBrowserPanelGroup isHide={isHideFileBrowser} />
      <Alert showIcon={!isHideError} type="error" description={error} />
      <EmptyStateLoader title="" isHide={isHideEmptyStateLoader} />
    </div>
  );
};
