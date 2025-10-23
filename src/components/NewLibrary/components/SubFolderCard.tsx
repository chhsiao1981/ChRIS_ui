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
import { elipses } from "../../../api/common";
import type { FileBrowserFolder } from "../../../api/types";
import * as DoCart from "../../../reducers/cart";
import { PathType } from "../../../reducers/types";
import * as DoUser from "../../../reducers/user";
import { ThemeContext } from "../../DarkTheme/useTheme";
import useAssociatedFeed from "../../GnomeLibrary/utils/useAssociatedFeed";
import { FolderIcon } from "../../Icons";
import { OperationContext } from "../context";
import getBackgroundRowColor from "../utils/getBackgroundRowColor";
import getFolderName from "../utils/getFolderName";
import useLongPress from "../utils/useLongPress";
import FolderContextMenu from "./FolderContextMenu";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  folder: FileBrowserFolder;
  computedPath: string;
  onFolderClick: (path: string) => void;

  useCart: UseThunk<DoCart.State, TDoCart>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { folder, computedPath, onFolderClick, useCart, useUser } = props;
  const [classStateCart, _] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const [classStateUser, _2] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;

  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const { handlers } = useLongPress(useCart);

  const { onClick, onMouseDown, onChangeCheckbox } = handlers;
  const folderName = getFolderName(folder, computedPath);
  const { data: dataName, isLoading } = useAssociatedFeed(folderName);

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
            onClick(e, folder, folder.path, PathType.Folder, () => {
              onFolderClick(folderName);
            });
          }}
          onContextMenu={(e) =>
            onClick(e, folder, folder.path, PathType.Folder)
          }
          onMouseDown={onMouseDown}
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
                    onChangeCheckbox(e, folder.path, folder, PathType.Folder)
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
                    onFolderClick(folderName);
                  }}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  {!dataName && !isLoading
                    ? elipses(folderName, 40)
                    : dataName
                      ? elipses(dataName, 40)
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
