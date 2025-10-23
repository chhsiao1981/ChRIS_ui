import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button, Checkbox, Skeleton } from "@patternfly/react-core";
import {
  ExternalLinkSquareAltIcon,
  FileIcon,
  FolderIcon,
} from "@patternfly/react-icons";
import { Tag } from "antd";
import { format } from "date-fns";
import type { MouseEvent } from "react";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";
import * as DoCart from "../../reducers/cart";
import { PathType } from "../../reducers/types";
import { formatBytes } from "../Feeds/utilties";
import type { OperationContext } from "../NewLibrary/context";
import useNewResourceHighlight from "../NewLibrary/utils/useNewResourceHighlight";
import { GnomeContextMenu } from "./GnomeContextMenu";
import styles from "./gnome.module.css";
import useAssociatedFeed from "./utils/useAssociatedFeed";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

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
  theType: PathType;
  computedPath: string;
  onFolderClick: () => void;
  onFileClick: () => void;
  origin: {
    type: OperationContext;
    additionalKeys: string[];
  };

  username: string;

  useCart: UseThunk<DoCart.State, TDoCart>;
};

const GnomeBaseRow = (props: BaseProps) => {
  const {
    resource,
    name,
    date,
    owner,
    size,
    theType,
    computedPath,
    onFolderClick,
    onFileClick,
    origin,
    rowIndex,
    username,
    useCart,
  } = props;

  // Redux dispatch for selection management
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const { isNewResource, scrollToNewResource } = useNewResourceHighlight(date);
  const isSelected = selectedPaths.some((payload) => {
    if (theType === PathType.Folder) {
      const folder = resource as FileBrowserFolder;
      return payload.path === folder.path;
    } else if (theType === PathType.Link) {
      const link = resource as FileBrowserFolderLinkFile;
      return payload.path === link.path;
    } else if (theType === PathType.File) {
      const theFile = resource as FileBrowserFolderFile;
      return payload.path === theFile.fname;
    }
    return false;
  });

  const pathForCart = (() => {
    if (theType === PathType.Folder) {
      const folder = resource as FileBrowserFolder;
      return folder.path;
    } else if (theType === PathType.Link) {
      const link = resource as FileBrowserFolderLinkFile;
      return link.path;
    } else if (theType === PathType.File) {
      const theFile = resource as FileBrowserFolderFile;
      return theFile.fname;
    }
    return "";
  })();

  const toggleSelection = () => {
    if (isSelected) {
      doCart.removeSelectedPath(cartID, pathForCart);
    } else {
      doCart.addSelectedPath(cartID, {
        path: pathForCart,
        type: theType,
        payload: resource,
      });
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
      if (theType === PathType.Folder) {
        onFolderClick();
      } else {
        onFileClick();
      }
    }
  };

  // Handle context menu events
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    // Select the item that was right-clicked if not already selected
    if (!isSelected) {
      doCart.addSelectedPath(cartID, {
        path: pathForCart,
        type: theType,
        payload: resource,
      });
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
              id={`select-${theType}-${rowIndex}`}
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
          onContextMenu={onContextMenu}
          aria-label={`${name} ${theType}`}
        >
          <div className={styles.fileName}>
            {theType === "folder" ? (
              <FolderIcon />
            ) : theType === "link" ? (
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

type Props = Omit<BaseProps, "theType">;
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
    <GnomeBaseRow
      {...props}
      name={data ? data : name}
      theType={PathType.Folder}
    />
  );
};

export const GnomeFileRow = (props: Props) => (
  <GnomeBaseRow {...props} theType={PathType.File} />
);

export const GnomeLinkRow = (props: Props) => (
  <GnomeBaseRow {...props} theType={PathType.Link} />
);
