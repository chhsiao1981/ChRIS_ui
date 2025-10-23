import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { Skeleton } from "@patternfly/react-core";
import { TableText, Td, Tr } from "@patternfly/react-table";
import { Tag } from "antd";
import { format } from "date-fns";
import { type } from "os";
import path from "path";
import { useContext } from "react";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";
import type * as DoCart from "../../../reducers/cart";
import { PathType, type PayloadType } from "../../../reducers/types";
import { useAppSelector } from "../../../store/hooks";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { formatBytes } from "../../Feeds/utilties";
import useAssociatedFeed from "../../GnomeLibrary/utils/useAssociatedFeed";
import type { OperationContext } from "../context";
import getBackgroundRowColor from "../utils/getBackgroundRowColor";
import useLongPress from "../utils/useLongPress";
import useNewResourceHighlight from "../utils/useNewResourceHighlight";
import { COLUMN_NAMES } from "./constants";
import FolderContextMenu from "./FolderContextMenu";

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
  type: PathType;
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

const BaseRow = (props: BaseProps) => {
  const {
    resource,
    name,
    date: theDate,
    owner,
    size: theSize,
    type: theType,
    computedPath,
    onFolderClick,
    onFileClick,
    origin,

    username,
    useCart,
  } = props;

  const { handlers } = useLongPress(useCart);
  const { onClick } = handlers;
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const { isDarkTheme } = useContext(ThemeContext);
  const { isNewResource, scrollToNewResource } =
    useNewResourceHighlight(theDate);
  const isSelected = selectedPaths.some((eachPath) => {
    if (theType === PathType.Folder) {
      return eachPath.path === (resource as FileBrowserFolder).path;
    } else if (theType === PathType.Link) {
      return eachPath.path === (resource as FileBrowserFolderLinkFile).path;
    } else if (theType === PathType.File) {
      return eachPath.path === (resource as FileBrowserFolderFile).fname;
    }
    return false;
  });
  const path = getResourcePath(theType, resource);
  const shouldHighlight = isNewResource || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
  const icon = getIcon(theType, isDarkTheme, { marginRight: "0.5em" });
  const onClickItem = () => {
    if (theType === PathType.Folder) {
      onFolderClick();
    } else {
      onFileClick();
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
          onClick(e, resource, path, theType, () => {
            onClickItem();
          });
        }}
        onContextMenu={(e) => {
          onClick(e, resource, path, theType);
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
              handlers.onChangeCheckbox(event, path, resource, theType);
            }}
          />
        </Td>
        <Td dataLabel={COLUMN_NAMES.name} modifier="nowrap">
          <div style={{ display: "flex", alignItems: "center" }}>
            {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
            {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onClickItem();
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
                onClickItem();
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
        <Td dataLabel={COLUMN_NAMES.date} modifier="nowrap">
          <TableText
            wrapModifier="truncate"
            tooltip={format(new Date(theDate), "dd MMM yyyy, HH:mm")}
          >
            {format(new Date(theDate), "dd MMM yyyy, HH:mm")}
          </TableText>
        </Td>
        {origin.type !== "fileBrowser" && (
          <Td dataLabel={COLUMN_NAMES.owner} modifier="nowrap">
            <TableText wrapModifier="truncate" tooltip={owner}>
              {owner}
            </TableText>
          </Td>
        )}
        <Td dataLabel={COLUMN_NAMES.size} modifier="nowrap">
          <TableText>{theSize > 0 ? formatBytes(theSize, 0) : " "}</TableText>
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

type Props = Omit<BaseProps, "type">;

export const FolderRow = (props: Props) => {
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
  return (
    <BaseRow
      {...props}
      name={data ? data : props.name}
      type={PathType.Folder}
    />
  );
};

export const FileRow = (props: Props) => (
  <BaseRow {...props} type={PathType.File} />
);

export const LinkRow = (props: Props) => (
  <BaseRow {...props} type={PathType.Link} />
);

const getResourcePath = (theType: PathType, resource: PayloadType) => {
  if (theType === PathType.Folder) {
    return (resource as FileBrowserFolder).path;
  } else if (theType === PathType.Link) {
    return (resource as FileBrowserFolderLinkFile).path;
  } else if (theType === PathType.File) {
    return (resource as FileBrowserFolderFile).fname;
  }
  return "";
};
