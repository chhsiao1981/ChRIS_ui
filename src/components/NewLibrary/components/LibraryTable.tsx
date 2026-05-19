//XXX seems deprecated.

import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Skeleton } from "@patternfly/react-core";
import {
  type ISortBy,
  type OnSort,
  type SortByDirection,
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Drawer, Tag } from "antd";
import { format } from "date-fns";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";
import useLongPress, {
  getBackgroundRowColor,
  useAssociatedFeed,
} from "../../../deprecated/components/NewLibrary/utils/longpress";
import * as DoCart from "../../..//reducers/cart";
import * as DoUser from "../../../reducers/user";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { formatBytes } from "../../FeedList/utilties";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext } from "../context";
import useNewResourceHighlight from "../utils/useNewResourceHighlight";
import { FolderContextMenu } from "./ContextMenu";
import { getFileName, getLinkFileName } from "./FileCard";
import { getFolderName } from "./FolderCard";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

interface TableProps {
  data: {
    folders: FileBrowserFolder[];
    files: FileBrowserFolderFile[];
    linkFiles: FileBrowserFolderLinkFile[];
  };
  computedPath: string;
  handleFolderClick: (folderName: string) => void;
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
}

const columnNames = {
  name: "Name",
  date: "Created",
  owner: "Creator",
  size: "Size",
};

type RowProps = {
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
  type: "folder" | "file" | "link";
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

export const BaseRow = (props: RowProps) => {
  const {
    resource,
    name,
    date,
    owner,
    size,
    type,
    computedPath,
    onFolderClick: handleFolderClick,
    onFileClick: handleFileClick,
    origin,

    username,

    useCart,
  } = props;
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;

  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const { isDarkTheme } = useContext(ThemeContext);
  const { isNewResource, scrollToNewResource } = useNewResourceHighlight(date);
  const isSelected = selectedPaths.some((payload) => {
    if (type === "folder" || type === "link") {
      return payload.path === resource.path;
    }
    if (type === "file") {
      return payload.path === resource.fname;
    }
    return false;
  });
  const shouldHighlight = isNewResource || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
  const icon = getIcon(type, isDarkTheme, { marginRight: "0.5em" });
  const path =
    type === "folder" || type === "link" ? resource.path : resource.fname;
  const handleItem = () => {
    if (type === "folder") {
      handleFolderClick();
    } else {
      handleFileClick();
    }
  };
  return (
    <FolderContextMenu
      origin={origin}
      key={path}
      computedPath={computedPath}
      username={username}
    >
      <Tr
        ref={scrollToNewResource}
        style={{ background: highlightedBgRow, cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          handleOnClick(e, resource, path, type, () => {
            handleItem();
          });
        }}
        onContextMenu={(e) => {
          handleOnClick(e, resource, path, type);
        }}
      >
        <Td className="pf-v5-c-table__check">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(event) => {
              event.stopPropagation();
              event.nativeEvent.stopImmediatePropagation();
            }}
            onChange={(event) => {
              handlers.handleCheckboxChange(event, path, resource, type);
            }}
          />
        </Td>
        <Td dataLabel={columnNames.name} modifier="nowrap">
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleItem();
              }}
              style={{ cursor: "pointer", color: "#1fa7f8" }}
            >
              {icon}
            </div>
            <TableText
              wrapModifier="truncate"
              tooltip={name}
              style={{
                cursor: "pointer",
                marginLeft: "0.5em",
                color: "#1fa7f8",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleItem();
              }}
            >
              {name}
              {isNewResource && (
                <span style={{ marginLeft: "0.5em" }}>
                  <Tag color="#3E8635">Newly Added</Tag>
                </span>
              )}
            </TableText>
          </div>
        </Td>
        <Td dataLabel={columnNames.date} modifier="nowrap">
          <TableText
            wrapModifier="truncate"
            tooltip={format(new Date(date), "dd MMM yyyy, HH:mm")}
          >
            {format(new Date(date), "dd MMM yyyy, HH:mm")}
          </TableText>
        </Td>
        {origin.type !== "fileBrowser" && (
          <Td dataLabel={columnNames.owner} modifier="nowrap">
            <TableText wrapModifier="truncate" tooltip={owner}>
              {owner}
            </TableText>
          </Td>
        )}
        <Td dataLabel={columnNames.size} modifier="nowrap">
          <TableText>{size > 0 ? formatBytes(size, 0) : " "}</TableText>
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

export const FolderRow: React.FC<Omit<RowProps, "type">> = (props) => {
  const { data, isLoading } = useAssociatedFeed(props.name);
  if (isLoading) {
    return (
      <Tr>
        <Td>
          <Skeleton width="100%" />
        </Td>
      </Tr>
    );
  }
  return <BaseRow {...props} name={data ? data : props.name} type="folder" />;
};

export const FileRow = (props: Omit<RowProps, "type">) => (
  <BaseRow {...props} type="file" />
);

export const LinkRow = (props: Omit<RowProps, "type">) => (
  <BaseRow {...props} type="link" />
);

export default (props: TableProps) => {
  const { data, computedPath, handleFolderClick, useUser } = props;
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;
  const navigate = useNavigate();
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();
  const [sortBy, setSortBy] = useState<ISortBy>({
    index: 0,
    direction: "asc",
  });
  const handleFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };
  const onSort: OnSort = (_event, columnIndex, sortByDirection) => {
    setSortBy({ index: columnIndex, direction: sortByDirection });
    return sortRows(columnIndex, sortByDirection);
  };
  const sortRows = (index: number, direction: SortByDirection) => {
    const sortedData = { ...data };
    if (index === 1) {
      sortedData.folders.sort(
        (a, b) =>
          getFolderName(a, computedPath).localeCompare(
            getFolderName(b, computedPath),
          ) * (direction === "asc" ? 1 : -1),
      );
      sortedData.files.sort(
        (a, b) =>
          getFileName(a).localeCompare(getFileName(b)) *
          (direction === "asc" ? 1 : -1),
      );
      sortedData.linkFiles.sort(
        (a, b) =>
          getLinkFileName(a).localeCompare(getLinkFileName(b)) *
          (direction === "asc" ? 1 : -1),
      );
    } else if (index === 2) {
      sortedData.folders.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.files.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.linkFiles.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
    }
  };
  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };
  return (
    <React.Fragment>
      <Drawer
        width="100%"
        open={preview}
        closable={true}
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

      <Table
        className="library-table"
        variant="compact"
        aria-label="Simple table"
        isStriped={true}
        isStickyHeader={true}
      >
        <Thead>
          <Tr>
            <Th screenReaderText="Select a row" arial-label="Select a row" />
            <Th
              sort={{ sortBy, onSort, columnIndex: 1 }}
              width={40}
              name="name"
            >
              {columnNames.name}
            </Th>
            <Th
              sort={{ sortBy, onSort, columnIndex: 2 }}
              width={20}
              name="date"
            >
              {columnNames.date}
            </Th>
            <Th name="owner" width={20}>
              {columnNames.owner}
            </Th>
            <Th name="size" width={20}>
              {columnNames.size}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.folders.map((resource: FileBrowserFolder, index) => (
            <FolderRow
              rowIndex={index}
              key={resource.data.path}
              resource={resource}
              name={getFolderName(resource, computedPath)}
              date={resource.data.creation_date}
              owner={resource.data.owner_username}
              size={0}
              computedPath={computedPath}
              onFolderClick={() => {
                const name = getFolderName(resource, computedPath);
                handleFolderClick(name);
              }}
              onFileClick={() => {
                return;
              }}
              origin={origin}
              username={username}
            />
          ))}
          {data.files.map((resource: FileBrowserFolderFile, index) => (
            <FileRow
              rowIndex={index}
              key={resource.data.fname}
              resource={resource}
              name={getFileName(resource)}
              date={resource.data.creation_date}
              owner={resource.data.owner_username}
              size={resource.data.fsize}
              computedPath={computedPath}
              onFolderClick={() => {
                return;
              }}
              onFileClick={() => {
                handleFileClick(resource);
              }}
              origin={origin}
              username={username}
            />
          ))}
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile, index) => (
            <LinkRow
              rowIndex={index}
              key={resource.data.path}
              resource={resource}
              name={getLinkFileName(resource)}
              date={resource.data.creation_date}
              owner={resource.data.owner_username}
              size={resource.data.fsize}
              computedPath={computedPath}
              onFolderClick={() => {
                return;
              }}
              onFileClick={() => {
                navigate(resource.data.path);
              }}
              origin={origin}
              username={username}
            />
          ))}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};
