import { Alert } from "../Antd";
import "./FeedOutputBrowser.css";
import {
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";
import * as DoCart from "../../reducers/cart";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoUser from "../../reducers/user";
import { EmptyStateLoader } from "./EmptyStateLoader";
import FetchFilesLoader from "./FetchFilesLoader";
import FileBrowser from "./FileBrowser";
import { useFeedBrowser } from "./useFeedBrowser";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  statuses: { [id: number]: string };
};

export default (props: Props) => {
  const { statuses } = props;
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const {
    selected,
    pluginFilesPayload,
    handleFileClick,
    filesLoading,
    isError,
    error,
    currentPath,
    fetchMore,
    observerTarget,
    handlePagination,
    finished,
  } = useFeedBrowser(statuses, useDrawer);

  const isHideFetchFilesLoader = finished;
  const isHideFileBrowser =
    !finished || !pluginFilesPayload || !selected || isError;
  const isHideError = !finished || !isError;
  const isHideEmptyStateLoader =
    !isHideFetchFilesLoader || !isHideFileBrowser || !isHideError;

  return (
    <div style={{ height: "100%" }} className="feed-output-browser">
      <FetchFilesLoader
        title="Plugin executing. Files will be fetched when plugin completes"
        isHide={isHideFetchFilesLoader}
      />
      <FileBrowser
        selected={selected}
        handleFileClick={handleFileClick}
        pluginFilesPayload={pluginFilesPayload}
        currentPath={currentPath}
        fetchMore={fetchMore}
        observerTarget={observerTarget}
        handlePagination={handlePagination}
        isLoading={filesLoading}
        isHide={isHideFileBrowser}
        useUser={useUser}
        useDrawer={useDrawer}
        useExplorer={useExplorer}
        useFeed={useFeed}
        useCart={useCart}
      />
      <Alert
        showIcon={!isHideError}
        type="error"
        description={error?.message}
      />
      <EmptyStateLoader title="" isHide={isHideEmptyStateLoader} />
    </div>
  );
};
