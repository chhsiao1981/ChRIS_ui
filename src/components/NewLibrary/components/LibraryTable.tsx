import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import {
  type ISortBy,
  type OnSort,
  type SortByDirection,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Drawer } from "antd";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";
import type * as DoUser from "../../../reducers/user";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext } from "../context";
import getFileName from "../utils/getFileName";
import getFolderName from "../utils/getFolderName";
import getLinkFileName from "../utils/getLinkFileName";
import { COLUMN_NAMES } from "./constants";
import { FileRow, FolderRow, LinkRow } from "./LibraryRow";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
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
};

export default (props: Props) => {
  const {
    data,
    computedPath,
    handleFolderClick: onFolderClick,
    useUser,
  } = props;
  const navigate = useNavigate();
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();
  const [sortBy, setSortBy] = useState<ISortBy>({
    index: 0,
    direction: "asc",
  });
  const onFileClick = (file: FileBrowserFolderFile) => {
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
        const dateA = new Date(a.creation_date).getTime();
        const dateB = new Date(b.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.files.sort((a, b) => {
        const dateA = new Date(a.creation_date).getTime();
        const dateB = new Date(b.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.linkFiles.sort((a, b) => {
        const dateA = new Date(a.creation_date).getTime();
        const dateB = new Date(b.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
    }
  };
  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };

  const isHideFileDetailView = !selectedFile;
  return (
    <Fragment>
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
        <FileDetailView
          selectedFile={selectedFile}
          preview="large"
          isHide={isHideFileDetailView}
          useUser={useUser}
        />
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
              {COLUMN_NAMES.name}
            </Th>
            <Th
              sort={{ sortBy, onSort, columnIndex: 2 }}
              width={20}
              name="date"
            >
              {COLUMN_NAMES.date}
            </Th>
            <Th name="owner" width={20}>
              {COLUMN_NAMES.owner}
            </Th>
            <Th name="size" width={20}>
              {COLUMN_NAMES.size}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.folders.map((resource: FileBrowserFolder, index) => (
            <FolderRow
              rowIndex={index}
              key={resource.path}
              resource={resource}
              name={getFolderName(resource, computedPath)}
              date={resource.creation_date}
              owner={resource.owner_username}
              size={0}
              computedPath={computedPath}
              handleFolderClick={() => {
                const name = getFolderName(resource, computedPath);
                onFolderClick(name);
              }}
              handleFileClick={() => {
                return;
              }}
              origin={origin}
            />
          ))}
          {data.files.map((resource: FileBrowserFolderFile, index) => (
            <FileRow
              rowIndex={index}
              key={resource.fname}
              resource={resource}
              name={getFileName(resource)}
              date={resource.creation_date}
              owner={resource.owner_username}
              size={resource.fsize}
              computedPath={computedPath}
              handleFolderClick={() => {
                return;
              }}
              handleFileClick={() => {
                onFileClick(resource);
              }}
              origin={origin}
            />
          ))}
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile, index) => (
            <LinkRow
              rowIndex={index}
              key={resource.path}
              resource={resource}
              name={getLinkFileName(resource)}
              date={resource.creation_date}
              owner={resource.owner_username}
              size={resource.fsize}
              computedPath={computedPath}
              handleFolderClick={() => {
                return;
              }}
              handleFileClick={() => {
                navigate(resource.path);
              }}
              origin={origin}
            />
          ))}
        </Tbody>
      </Table>
    </Fragment>
  );
};
