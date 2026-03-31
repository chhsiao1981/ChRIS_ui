import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  GridItem,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { differenceInSeconds, format } from "date-fns";
import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { elipses } from "../../../api/common";
import type { FileBrowserFolder } from "../../../api/types";
import useLongPress, {
  getBackgroundRowColor,
  useAssociatedFeed,
} from "../../../deprecated/components/NewLibrary/utils/longpress";
import * as DoCart from "../../..//reducers/cart";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { FolderIcon } from "../../Icons";
import { OperationContext } from "../context";
import { FolderContextMenu } from "./ContextMenu";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type FolderCardProps = {
  folders: FileBrowserFolder[];
  handleFolderClick: (path: string) => void;
  computedPath: string;
  pagination?: Pagination;
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};
export const FolderCard = (props: FolderCardProps) => {
  const { folders, handleFolderClick, computedPath, username, useCart } = props;
  return (
    <Fragment>
      {folders.map((folder) => {
        return (
          <SubFolderCard
            key={`sub_folder_${folder.path}`}
            folder={folder}
            computedPath={computedPath}
            handleFolderClick={handleFolderClick}
            username={username}
            useCart={useCart}
          />
        );
      })}
    </Fragment>
  );
};

export const getFolderName = (
  folder: FileBrowserFolder,
  computedPath: string,
) => {
  const folderPathParts = folder.path.split("/");
  const pathName = folderPathParts[folderPathParts.length - 1];
  const folderName = computedPath === "/" ? folder.path : pathName;
  return folderName;
};

type SubFolderCardProps = {
  folder: FileBrowserFolder;
  computedPath: string;
  handleFolderClick: (path: string) => void;
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export const SubFolderCard = (props: SubFolderCardProps) => {
  const { folder, computedPath, handleFolderClick, username, useCart } = props;
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const { handlers } = useLongPress();

  const { handleOnClick, handleOnMouseDown, handleCheckboxChange } = handlers;
  const folderName = getFolderName(folder, computedPath);
  const { data: feedName, isLoading } = useAssociatedFeed(folderName);

  const creationDate = folder.creation_date;
  const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);

  const [isNewFolder, setIsNewFolder] = useState<boolean>(
    secondsSinceCreation <= 15,
  );

  useEffect(() => {
    if (isNewFolder) {
      const timeoutId = setTimeout(() => {
        setIsNewFolder(false);
      }, 2000); // 60 seconds

      // Cleanup the timeout if the component unmounts before the timeout completes
      return () => clearTimeout(timeoutId);
    }
  }, [isNewFolder]);

  const isSelected = selectedPaths.some(
    (payload) => payload.path === folder.path,
  );

  const shouldHighlight = isNewFolder || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);

  return (
    <GridItem xl={3} lg={4} md={6} sm={12} key={folder.id}>
      <FolderContextMenu
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        computedPath={computedPath}
        username={username}
      >
        <Card
          style={{
            background: highlightedBgRow,
            cursor: "pointer",
          }}
          isSelected={isSelected}
          isClickable
          isSelectable
          isCompact
          isFlat
          onClick={(e) => {
            handleOnClick(e, folder, folder.path, "folder", () => {
              handleFolderClick(folderName);
            });
          }}
          onContextMenu={(e) => handleOnClick(e, folder, folder.path, "folder")}
          onMouseDown={handleOnMouseDown}
          isRounded
        >
          <CardHeader
            actions={{
              actions: (
                <Checkbox
                  className="large-checkbox"
                  isChecked={isSelected}
                  id={`${folder.id}`}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleCheckboxChange(e, folder.path, folder, "folder")
                  }
                />
              ),
            }}
          >
            <Split>
              <SplitItem style={{ marginRight: "1em" }}>
                <FolderIcon />
              </SplitItem>
              <SplitItem>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFolderClick(folderName);
                  }}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  {!feedName && !isLoading
                    ? elipses(folderName, 40)
                    : feedName
                      ? elipses(feedName, 40)
                      : "Fetching..."}
                </Button>
                <div
                  style={{
                    fontSize: "0.85rem",
                  }}
                >
                  {!isEmpty(creationDate)
                    ? format(new Date(creationDate), "dd MMM yyyy, HH:mm")
                    : "N/A"}
                </div>
              </SplitItem>
            </Split>
          </CardHeader>
        </Card>
      </FolderContextMenu>
    </GridItem>
  );
};
