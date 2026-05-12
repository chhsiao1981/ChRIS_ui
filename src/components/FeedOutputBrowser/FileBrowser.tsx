import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Grid,
  Spinner,
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { PluginInstance } from "../../api/types";
import { useDownload } from "../../hooks/useDownload";
import * as DoCart from "../../reducers/cart";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoOperation from "../../reducers/operation";
import * as DoUser from "../../reducers/user";
import { notification } from "../Antd";
import { ClipboardCopyContainer } from "../Common";
import DrawerActionButton from "../DrawerUtils/DrawerActionButton";
import { onMaximize, onMinimize } from "../FeedUtils";
import {
  getFileName,
  getLinkFileName,
} from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import {
  FileRow,
  FolderRow,
  LinkRow,
} from "../NewLibrary/components/LibraryTable";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext } from "../NewLibrary/context";
import FileDetailView from "../Preview/FileDetailView";
import styles from "./FileBrowser.module.css";
import SkeletonRows from "./SkeletonRows";
import type { FilesPayload } from "./types";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;

const previewAnimation = [{ opacity: "0.0" }, { opacity: "1.0" }];

const previewAnimationTiming = {
  duration: 1000,
  iterations: 1,
};
const columnNames = {
  name: "Name",
  created: "Created",
  creator: "Creator",
  size: "Size",
};

type Props = {
  pluginFilesPayload?: FilesPayload;
  handleFileClick: (path: string) => void;
  selected?: PluginInstance;
  currentPath: string;
  isLoading: boolean;
  handlePagination: () => void;
  fetchMore?: boolean;
  observerTarget?: React.MutableRefObject<any>;
  isHide?: boolean;
};

export default (props: Props) => {
  const {
    pluginFilesPayload: pluginFilesPayloadProps,
    handleFileClick,
    selected,
    currentPath: additionalKey,
    observerTarget,
    fetchMore,
    handlePagination,
    isLoading,
    isHide,
  } = props;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const useOperation = useThunk<DoOperation.State, TDoOperation>(DoOperation);

  const [classUser, _] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { username, isStaff } = user;

  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);

  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);
  const explorer = getState(classExplorer) || DoExplorer.defaultState;
  const { selectedFile } = explorer;

  const [classFeed, _2] = useFeed;
  const feed = getState(classFeed) || DoFeed.defaultState;
  const { data: feedData } = feed;

  const [classOperation, _doOperation] = useOperation;
  const operationID = getDefaultID(classOperation);

  const handleDownloadMutation = useDownload(feedData);
  const [api, contextHolder] = notification.useNotification();
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;
  const pluginFilesPayload = pluginFilesPayloadProps || {};

  const { subFoldersMap, linkFilesMap, filesMap, folderList } =
    pluginFilesPayload;
  const breadcrumb = useMemo(() => additionalKey.split("/"), [additionalKey]);
  const currentPath = `home/${username}/feeds/feed_${feedData?.id}/${selected?.plugin_name}_${selected?.id}/data`;
  const noFiles = useMemo(
    () =>
      filesMap?.length === 0 &&
      subFoldersMap?.length === 0 &&
      linkFilesMap?.length === 0,
    [filesMap, subFoldersMap, linkFilesMap],
  );

  useEffect(() => {
    if (isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });

      setTimeout(() => {
        handleDownloadMutation.reset();
      }, 1000);
    }

    if (isError) {
      api.error({
        message: "Download Error",
        description: downloadError.message,
      });
    }
  }, [api, isSuccess, isError, downloadError, handleDownloadMutation]);

  const generateBreadcrumb = (value: string, index: number) => {
    const onClick = () => {
      doExplorer.clearSelectedFile(explorerID);
      if (index === breadcrumb.length - 1) {
        return;
      }
      const findIndex = breadcrumb.findIndex((path) => path === value);
      if (findIndex !== -1) {
        const newPathList = breadcrumb.slice(0, findIndex + 1);
        handleFileClick(newPathList.join("/"));
      }
    };

    const disabledIndex = breadcrumb.findIndex(
      (path) => path === `${selected?.plugin_name}_${selected?.id}`,
    );

    const shouldNotClick =
      (disabledIndex > 1 && index <= disabledIndex) ||
      selected?.plugin_type === "fs";

    return (
      <BreadcrumbItem
        showDivider={true}
        key={index}
        onClick={() => {
          shouldNotClick ? undefined : onClick();
        }}
        to={index === breadcrumb.length - 1 || shouldNotClick ? undefined : "#"}
      >
        {value}
      </BreadcrumbItem>
    );
  };

  const toggleAnimation = () => {
    document
      .querySelector(".preview-panel")
      ?.animate(previewAnimation, previewAnimationTiming);
    document
      .querySelector(".large-preview")
      ?.animate(previewAnimation, previewAnimationTiming);
  };

  const origin = {
    type: OperationContext.FILEBROWSER,
    additionalKeys: [additionalKey],
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const className = isHide ? `file-browser ${styles.hide}` : "file-browser";

  const previewStyle: CSSProperties = {};
  if (!drawer.preview.open) {
    previewStyle.display = "none";
  }

  const isHideFileDetailView =
    isHide || drawer.preview.currentlyActive !== "preview" || !selectedFile;

  return (
    <Grid hasGutter className={className}>
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="horizontal">
        {drawer.files.open && (
          <>
            <Panel
              className="custom-panel"
              order={1}
              id="4"
              defaultSize={53}
              minSize={20}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <DrawerActionButton
                onMaximize={() => {
                  onMaximize(drawerID, "files", doDrawer);
                }}
                onMinimize={() => {
                  onMinimize(drawerID, doDrawer);
                }}
                isMaximized={drawer.files.maximized}
              />

              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Operations
                    username={username}
                    isStaff={isStaff}
                    classNames={{
                      toolbar: "remove-toolbar-padding",
                    }}
                    styles={{
                      toolbar: {
                        backgroundColor: "inherit",
                      },
                    }}
                    useCart={useCart}
                    operationID={operationID}
                    useOperation={useOperation}
                    useUser={useUser}
                  />
                  <div className="file-browser-header">
                    <div className="file-browser-header-row">
                      <div className="file-browser-navigation">
                        <Tooltip
                          content={
                            <div className="file-browser-breadcrumb-popover">
                              <div className="file-browser-breadcrumb-row">
                                <ClipboardCopyContainer path={additionalKey} />
                                <Breadcrumb>
                                  {breadcrumb.map(generateBreadcrumb)}
                                </Breadcrumb>
                              </div>
                            </div>
                          }
                          position="bottom"
                          maxWidth="80vw"
                        >
                          <Button
                            variant="link"
                            className="file-browser-path-button"
                          >
                            <span className="file-browser-label">
                              Show current path
                            </span>
                          </Button>
                        </Tooltip>

                        {additionalKey !== currentPath &&
                          selected?.plugin_type === "fs" && (
                            <Tooltip content="Return to the plugin's root directory">
                              <Button
                                onClick={() => handleFileClick(currentPath)}
                                variant="link"
                                className="file-browser-path-button"
                              >
                                <span className="file-browser-label">
                                  Go to root
                                </span>
                              </Button>
                            </Tooltip>
                          )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minHeight: "32px",
                          minWidth: "120px",
                        }}
                      >
                        {isLoading && (
                          <>
                            <Spinner size="sm" aria-label="Loading files" />
                            <span>Loading files...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="file-list"
                    style={{
                      flexGrow: 1,
                      minHeight: 0,
                      overflow: "auto",
                    }}
                    ref={scrollRef}
                  >
                    <Table
                      style={{
                        backgroundColor: "inherit",
                      }}
                      variant="compact"
                      isStickyHeader={true}
                    >
                      <Thead aria-label="file-browser-table">
                        <Tr>
                          <Th aria-label="file-selection-checkbox" />
                          <Th aria-label="file-name" width={40}>
                            {columnNames.name}
                          </Th>
                          <Th aria-label="file-creator" width={20}>
                            {columnNames.created}
                          </Th>
                          <Th aria-label="file-size" width={20}>
                            {columnNames.size}
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isLoading && noFiles ? (
                          <SkeletonRows />
                        ) : (
                          <>
                            {filesMap?.map((theFile, index) => (
                              <FileRow
                                key={theFile.fname}
                                rowIndex={index}
                                resource={theFile}
                                name={getFileName(theFile)}
                                date={theFile.creation_date}
                                owner={theFile.owner_username}
                                size={theFile.fsize}
                                computedPath={additionalKey}
                                handleFolderClick={() => {}}
                                handleFileClick={() => {
                                  toggleAnimation();
                                  doExplorer.setSelectedFile(
                                    explorerID,
                                    theFile,
                                  );
                                  !drawer.preview.open &&
                                    doDrawer.setFilePreviewPanel(drawerID);
                                }}
                                origin={origin}
                                username={username}
                                useCart={useCart}
                              />
                            ))}
                            {linkFilesMap?.map((linkFile, index) => (
                              <LinkRow
                                key={linkFile.path}
                                rowIndex={index}
                                resource={linkFile}
                                name={getLinkFileName(linkFile)}
                                date={linkFile.creation_date}
                                owner={linkFile.owner_username}
                                size={linkFile.fsize}
                                computedPath={additionalKey}
                                handleFolderClick={() => {}}
                                handleFileClick={async () => {
                                  /*
                                  try {
                                    const linkedResource =
                                      await linkFile.getLinkedResource();

                                    if (linkedResource) {
                                      // Check if it's a folder (has path property)
                                      if (
                                        "path" in linkedResource.data &&
                                        linkedResource instanceof
                                          FileBrowserFolder
                                      ) {
                                        handleFileClick(
                                          linkedResource.data.path,
                                        );
                                      }
                                      // Check if it's a file (has fname property)
                                      else if (
                                        "fname" in linkedResource &&
                                        linkedResource instanceof
                                          FileBrowserFolderFile
                                      ) {
                                        toggleAnimation();
                                        doExplorer.setSelectedFile(
                                          explorerID,
                                          linkedResource as FileBrowserFolderFile,
                                        );
                                        !drawer.preview.open &&
                                          doDrawer.setFilePreviewPanel(
                                            drawerID,
                                          );
                                      }
                                    }
                                  } catch (error) {
                                    // TODO: Handle error
                                    console.error(
                                      "Error handling link file:",
                                      error,
                                    );
                                  }
                                  */
                                }}
                                origin={origin}
                                username={username}
                                useCart={useCart}
                              />
                            ))}
                            {subFoldersMap?.map((resource, index) => (
                              <FolderRow
                                key={resource.path}
                                rowIndex={index}
                                resource={resource}
                                name={getFolderName(resource, additionalKey)}
                                date={resource.creation_date}
                                owner=" "
                                size={0}
                                computedPath={additionalKey}
                                handleFolderClick={() =>
                                  handleFileClick(resource.path)
                                }
                                handleFileClick={() => {}}
                                origin={origin}
                                username={username}
                                useCart={useCart}
                              />
                            ))}
                          </>
                        )}
                      </Tbody>
                    </Table>
                    {fetchMore && (
                      <div
                        ref={observerTarget}
                        style={{
                          height: "50px",
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "10px 0",
                        }}
                        data-testid="observer-target"
                      >
                        {isLoading ? (
                          <Spinner size="sm" aria-label="Loading more files" />
                        ) : (
                          <Button onClick={handlePagination} variant="link">
                            Load more data...
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            </Panel>
            <PanelResizeHandle className="ResizeHandle" />
          </>
        )}

        {/* preview */}
        <Panel
          order={2}
          id="5"
          defaultSize={47}
          minSize={20}
          style={previewStyle}
        >
          <DrawerActionButton
            onMaximize={() => {
              onMaximize(drawerID, "preview", doDrawer);
            }}
            onMinimize={() => {
              onMinimize(drawerID, doDrawer);
            }}
            isMaximized={drawer.preview.maximized}
          />

          <FileDetailView
            selectedFile={selectedFile}
            preview="large"
            isHide={isHideFileDetailView}
            useUser={useUser}
          />
        </Panel>
      </PanelGroup>
    </Grid>
  );
};
