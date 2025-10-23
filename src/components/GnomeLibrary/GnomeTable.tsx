import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Spinner } from "@patternfly/react-core";
import {
  AngleDownIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from "@patternfly/react-icons";
import { Drawer, notification } from "antd";
import { type RefObject, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getLinkedResource } from "../../api/serverApi";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";
import type * as DoCart from "../../reducers/cart";
import * as DoUser from "../../reducers/user";
import { OperationContext } from "../NewLibrary/context";
import getFileName from "../NewLibrary/utils/getFileName";
import getFolderName from "../NewLibrary/utils/getFolderName";
import getLinkFileName from "../NewLibrary/utils/getLinkFileName";
import FileDetailView from "../Preview/FileDetailView";
import GnomeBulkActionBar from "./GnomeActionBar";
import { GnomeFileRow, GnomeFolderRow, GnomeLinkRow } from "./GnomeRow";
import styles from "./gnome.module.css";
import { useInfiniteScroll } from "./utils/hooks/useInfiniteScroll";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  data: {
    folders: FileBrowserFolder[];
    files: FileBrowserFolderFile[];
    linkFiles: FileBrowserFolderLinkFile[];
    filesPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
    foldersPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
    linksPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
  };
  computedPath: string;
  onFolderClick: (folder: FileBrowserFolder) => void;
  fetchMore?: boolean;
  onPagination?: () => void;
  filesLoading?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const {
    data,
    computedPath,
    onFolderClick,
    fetchMore,
    onPagination,
    filesLoading,

    useUser,
    useCart,
  } = props;
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;

  const navigate = useNavigate();
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();
  const [sortBy, setSortBy] = useState<{
    index: number;
    direction: "asc" | "desc";
  }>({
    index: 0,
    direction: "asc",
  });

  // ref to the scrolling <ul>
  const listRef = useRef<HTMLUListElement>(null);

  // Use our custom infinite scroll hook
  const { sentinelRef, isNearBottom } = useInfiniteScroll({
    onLoadMore: onPagination || (() => {}),
    hasMore: !!fetchMore,
    isLoading: !!filesLoading,
    root: listRef, // Pass the ref directly, the hook will handle it
    threshold: 200, // Load more when within 200px of the bottom
    loadingDelay: 300, // Wait 300ms after loading before allowing another fetch
  });

  const onFileClick = (file: FileBrowserFolderFile) => {
    console.info("GnomeTable: onFileClick: file:", file);
    setSelectedFile(file);
    setShowPreview(true);
  };

  // Handle clicks on link entries: resolve to folder or file
  const onLinkClick = async (link: FileBrowserFolderLinkFile) => {
    console.info("GnomeTable: onLinkClick: file:", link);

    try {
      const linked = await getLinkedResource(link);
      // folder link
      if (linked && "path" in linked) {
        console.info("GnomeTable: onLinkClick: linked as Folder:", linked);
        navigate(`/library/${linked.path}`);
      }
      // file link
      else if (linked && "fname" in linked) {
        setSelectedFile(linked);
        setShowPreview(true);
      }
    } catch (err) {
      notification.error({
        message: "Error accessing link",
        description: "Could not open the linked resource.",
      });
    }
  };

  const onSort = (columnIndex: number) => {
    setSortBy((prev) => ({
      index: columnIndex,
      direction:
        prev.index === columnIndex && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortRows = () => {
    const sorted = { ...data };
    const { index, direction } = sortBy;
    const dir = direction === "asc" ? 1 : -1;

    if (index === 0) {
      sorted.folders.sort(
        (a, b) =>
          getFolderName(a, computedPath).localeCompare(
            getFolderName(b, computedPath),
          ) * dir,
      );
      sorted.files.sort(
        (a, b) => getFileName(a).localeCompare(getFileName(b)) * dir,
      );
      sorted.linkFiles.sort(
        (a, b) => getLinkFileName(a).localeCompare(getLinkFileName(b)) * dir,
      );
    } else if (index === 1) {
      sorted.folders.sort(
        (a, b) =>
          (new Date(a.creation_date).getTime() -
            new Date(b.creation_date).getTime()) *
          dir,
      );
      sorted.files.sort(
        (a, b) =>
          (new Date(a.creation_date).getTime() -
            new Date(b.creation_date).getTime()) *
          dir,
      );
      sorted.linkFiles.sort(
        (a, b) =>
          (new Date(a.creation_date).getTime() -
            new Date(b.creation_date).getTime()) *
          dir,
      );
    } else if (index === 2) {
      sorted.folders.sort(
        (a, b) => a.owner_username.localeCompare(b.owner_username) * dir,
      );
      sorted.files.sort(
        (a, b) => a.owner_username.localeCompare(b.owner_username) * dir,
      );
      sorted.linkFiles.sort(
        (a, b) => a.owner_username.localeCompare(b.owner_username) * dir,
      );
    } else if (index === 3) {
      sorted.files.sort((a, b) => (a.fsize - b.fsize) * dir);
      sorted.linkFiles.sort((a, b) => (a.fsize - b.fsize) * dir);
    }

    return sorted;
  };

  const sortedData = sortBy.index !== null ? sortRows() : data;

  // origin for operations
  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };

  return (
    <>
      <Drawer
        width="100%"
        open={preview}
        closable
        onClose={() => {
          setShowPreview(false);
          setSelectedFile(undefined);
        }}
        placement="right"
      >
        {selectedFile && (
          <FileDetailView
            selectedFile={selectedFile}
            preview="large"
            useUser={useUser}
          />
        )}
      </Drawer>

      <div className={styles.fileListContainer}>
        <div className={styles.fileListHeader}>
          {/* Checkbox header */}
          <div className={styles.fileCheckboxHeader} />
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileNameHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(0);
              }
            }}
            aria-label="Sort by name"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Name</span>
              {sortBy.index === 0 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileDateHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(1);
              }
            }}
            aria-label="Sort by creation date"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Created</span>
              {sortBy.index === 1 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileOwnerHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(2)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(2);
              }
            }}
            aria-label="Sort by creator"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Creator</span>
              {sortBy.index === 2 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileSizeHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(3)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(3);
              }
            }}
            aria-label="Sort by size"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Size</span>
              {sortBy.index === 3 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
        </div>

        <ul ref={listRef} className={styles.fileList}>
          {sortedData.folders.map((r, i) => (
            <GnomeFolderRow
              key={r.path}
              rowIndex={i}
              resource={r}
              name={getFolderName(r, computedPath)}
              date={r.creation_date}
              owner={r.owner_username}
              size={0}
              computedPath={computedPath}
              onFolderClick={() => onFolderClick(r)}
              onFileClick={() => {}}
              origin={origin}
              username={username}
              useCart={useCart}
            />
          ))}

          {sortedData.files.map((r, i) => (
            <GnomeFileRow
              key={r.fname}
              rowIndex={i}
              resource={r}
              name={getFileName(r)}
              date={r.creation_date}
              owner={r.owner_username}
              size={r.fsize}
              computedPath={computedPath}
              onFolderClick={() => {}}
              onFileClick={() => onFileClick(r)}
              origin={origin}
              username={username}
              useCart={useCart}
            />
          ))}

          {sortedData.linkFiles.map((r, i) => (
            <GnomeLinkRow
              key={r.path}
              rowIndex={i}
              resource={r}
              name={getLinkFileName(r)}
              date={r.creation_date}
              owner={r.owner_username}
              size={r.fsize}
              computedPath={computedPath}
              onFolderClick={() => {}}
              onFileClick={() => onLinkClick(r)}
              origin={origin}
              username={username}
              useCart={useCart}
            />
          ))}
          {/* Sentinel element for infinite scrolling */}
          <li
            ref={sentinelRef as RefObject<HTMLLIElement>}
            style={{ height: "1px", opacity: 0 }}
          />
        </ul>

        {/* Loading indicator - always present with fixed height to prevent layout shift */}
        <div className={styles.loadingContainer}>
          {filesLoading && (
            <>
              <Spinner size="md" />
              <span>Loading more files...</span>
            </>
          )}
          {/* Show scroll indicator when near bottom and not loading */}
          {isNearBottom && fetchMore && !filesLoading && (
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation>
            <div
              className={styles.scrollIndicator}
              aria-label="Continue scrolling to load more items"
            >
              <div className={styles.scrollArrow}>
                <AngleDownIcon />
              </div>
              <span>Continue scrolling to load more</span>
            </div>
          )}
        </div>
      </div>

      <GnomeBulkActionBar
        origin={origin}
        computedPath={computedPath}
        username={username}
        useCart={useCart}
      />
    </>
  );
};
