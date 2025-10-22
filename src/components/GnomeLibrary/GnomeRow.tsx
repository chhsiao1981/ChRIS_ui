import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Checkbox, Skeleton } from "@patternfly/react-core";
import {
  ExternalLinkSquareAltIcon,
  FileIcon,
  FolderIcon,
} from "@patternfly/react-icons";
import { Tag } from "antd";
import { format } from "date-fns";
import type { MouseEvent } from "react";
import { PathType } from "../../reducers/types";
import {
  clearSelectedPaths,
  setSelectedPaths,
} from "../../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { formatBytes } from "../Feeds/utilties";
import type { OperationContext } from "../NewLibrary/context";
import { useAssociatedFeed } from "../NewLibrary/utils/longpress";
import useNewResourceHighlight from "../NewLibrary/utils/useNewResourceHighlight";
import { GnomeContextMenu } from "./GnomeContextMenu";
import styles from "./gnome.module.css";

type BaseProps = {
  rowIndex: number;
  key: string;
  resource:
    | FileBrowserFolder
    | FileBrowserFolderFile
    | FileBrowserFolderLinkFile;
  name: string;
  date: string;
  owner: string;
  size: number;
  type: PathType;
  computedPath: string;
  onFolderClick: () => void;
  onFileClick: () => void;
  origin: {
    type: OperationContext;
    additionalKeys: string[];
  };

  username: string;
};

const GnomeBaseRow = (props: BaseProps) => {
  const {
    resource,
    name,
    date,
    owner,
    size,
    type,
    computedPath,
    onFolderClick,
    onFileClick,
    origin,
    rowIndex,
    username,
  } = props;

  // Redux dispatch for selection management
  const dispatch = useAppDispatch();
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const { isNewResource, scrollToNewResource } = useNewResourceHighlight(date);
  const isSelected = selectedPaths.some((payload) => {
    if (type === "folder" || type === "link") {
      return payload.path === resource.data.path;
    }
    if (type === "file") {
      return payload.path === resource.data.fname;
    }
    return false;
  });

  const pathForCart =
    type === "folder" || type === "link"
      ? resource.data.path
      : resource.data.fname;

  const toggleSelection = () => {
    if (isSelected) {
      dispatch(clearSelectedPaths(pathForCart));
    } else {
      dispatch(
        setSelectedPaths({ path: pathForCart, type, payload: resource }),
      );
    }
  };

  const onRowClick = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    // Stop propagation to prevent other handlers from firing
    e.stopPropagation();

    // Handle ctrl+click for selection
    if (e.ctrlKey) {
      toggleSelection();
    } else {
      // Otherwise navigate
      if (type === "folder") {
        onFolderClick();
      } else {
        onFileClick();
      }
    }
  };

  // Handle context menu events
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    // Select the item that was right-clicked if not already selected
    if (!isSelected) {
      dispatch(
        setSelectedPaths({ path: pathForCart, type, payload: resource }),
      );
    }
  };

  return (
    <GnomeContextMenu
      username={username}
      origin={origin}
      computedPath={computedPath}
    >
      <li
        key={pathForCart}
        ref={scrollToNewResource}
        className={`${styles.fileListRow} ${isSelected ? styles.selectedItem : ""}`}
      >
        <div className={styles.checkboxCell}>
          <div className={styles.checkboxWrapper}>
            <Checkbox
              id={`select-${type}-${rowIndex}`}
              aria-label="Select row"
              isChecked={isSelected}
              className={`${styles.largeCheckbox} ${styles.checkboxAlign}`}
              onChange={() => {
                toggleSelection();
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
          </div>
        </div>
        <Button
          variant="plain"
          className={`${styles.fileListItem} ${styles.fileListButton}`}
          onClick={onRowClick}
          onContextMenu={handleContextMenu}
          aria-label={`${name} ${type}`}
        >
          <div className={styles.fileName}>
            {type === "folder" ? (
              <FolderIcon />
            ) : type === "link" ? (
              <ExternalLinkSquareAltIcon />
            ) : (
              <FileIcon />
            )}
            <span className={styles.fileNameText} title={name}>
              {name}
            </span>
            {isNewResource && (
              <span className={styles.newlyAddedTag}>
                <Tag color="#3E8635">Newly Added</Tag>
              </span>
            )}
          </div>
          <div
            className={styles.fileDate}
            title={format(new Date(date), "dd MMM yyyy, HH:mm")}
          >
            {format(new Date(date), "dd MMM yyyy, HH:mm")}
          </div>
          {origin.type !== "fileBrowser" && (
            <div className={styles.fileOwner} title={owner}>
              {owner}
            </div>
          )}
          <div
            className={styles.fileSize}
            title={size > 0 ? formatBytes(size, 0) : " "}
          >
            {size > 0 ? formatBytes(size, 0) : " "}
          </div>
        </Button>
      </li>
    </GnomeContextMenu>
  );
};

type Props = Omit<BaseProps, "type">;
export const GnomeFolderRow = (props: Props) => {
  const { name } = props;
  const { data, isLoading } = useAssociatedFeed(name);
  if (isLoading) {
    return (
      <li className={styles.fileListItem}>
        <Skeleton width="100%" />
      </li>
    );
  }
  return (
    <GnomeBaseRow {...props} name={data ? data : name} type={PathType.Folder} />
  );
};

export const GnomeFileRow = (props: Props) => (
  <GnomeBaseRow {...props} type={PathType.File} />
);

export const GnomeLinkRow = (props: Props) => (
  <GnomeBaseRow {...props} type={PathType.Link} />
);
