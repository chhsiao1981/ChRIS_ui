import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { type OnSelect, Td, Tr } from "@patternfly/react-table";
import type { TdSelectType } from "@patternfly/react-table/dist/esm/components/Table/base/types";
import {
  type CSSProperties,
  type MouseEvent,
  useContext,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import type { Feed, FileBrowserFolder } from "../../api/types";
import * as DoCart from "../../reducers/cart";
import { ThemeContext } from "../DarkTheme/useTheme";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import { OperationContext } from "../NewLibrary/context";
import { formatDate } from "../utils/datetime";
import DonutUtilization from "./DonutUtilization";
import FeedInfoColumn from "./FeedInfoColumn";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

// -------------- TableRow Props --------------
type Props = {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  type: string;
  // additionalKeys: string[];
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { rowIndex, feed, type, username, useCart } = props;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);
  const cart = getState(classCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  /*
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  */
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);

  // Add a cache for folder data with proper typing
  const folderCache = useRef<FileBrowserFolder | null>(null);

  /**
   * Track row progress state for background color
   */
  const [rowProgress, setRowProgress] = useState<number | null>(null);
  const [rowError, setRowError] = useState<boolean>(false);

  /**
   * Get folder for this feed - with caching
   */
  /*
  const getFolderForThisFeed = async () => {
    // Return cached data if available
    if (folderCache.current) {
      return folderCache.current;
    }

    // Otherwise fetch and cache
    const payload = await feed.getFolder();
    folderCache.current = payload;
    return payload;
  };
  */

  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";
  /**
   * Only show special background if progress is being tracked and less than 100%
   */
  const backgroundRow =
    rowProgress !== null && rowProgress < 100 && !rowError
      ? backgroundColor
      : "inherit";

  const isSelected = selectedPaths.some(
    (payload) => payload.path === feed.folder_path,
  );

  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  const contextOrigin = {
    type: OperationContext.FEEDS,
    /* additionalKeys: additionalKeys, */
  };

  /**
   * Handle feed name click
   */
  const onFeedNameClick = () => {
    navigate(`/data/${feed.id}?type=${feed.public ? "public" : "private"}`);
  };

  const trStyle: CSSProperties = {
    backgroundColor: selectedBgRow,
    cursor: "pointer",
  };
  const onTrContextMenu = async (e: MouseEvent) => {
    // const payload = await getFolderForThisFeed();
    // handleOnClick(e, payload, feed.folder_path, "folder");
  };
  const onTrClick = (e: MouseEvent) => {
    e.stopPropagation();
    // const payload = await getFolderForThisFeed();
    /*
          handleOnClick(e, payload, feed.folder_path, "folder", () => {
            onFeedNameClick();
          });
          */
  };
  const onCheckboxSelect: OnSelect = (e, isSelected) => {
    e.stopPropagation();
    doCart.toggleSelectedFeed(cartID, feed, isSelected);
  };
  const checkBoxSelect: TdSelectType = {
    rowIndex: rowIndex,
    isSelected: isSelected,
    onSelect: onCheckboxSelect,
  };

  const onStatusProgressUpdate = (
    progress: number | null,
    isError: boolean,
  ) => {
    setRowProgress(progress);
    setRowError(isError);
  };

  return (
    <FolderContextMenu username={username} origin={contextOrigin}>
      <Tr
        key={feed.id}
        style={trStyle}
        data-testid={`${feed.name}-test`}
        onContextMenu={onTrContextMenu}
        onClick={onTrClick}
        isRowSelected={isSelected}
      >
        <Td onClick={(e) => e.stopPropagation()} select={checkBoxSelect} />
        <Td dataLabel="ID">{feed.id}</Td>
        <Td dataLabel="analysis">
          <FeedInfoColumn feed={feed} onClick={onFeedNameClick} />
        </Td>
        <Td dataLabel="created">{formatDate(feed.creation_date)}</Td>
        <Td dataLabel="creator">{feed.owner_username}</Td>
        {/* Status column with progress donut */}
        <Td dataLabel="status">
          <DonutUtilization
            feed={feed}
            type={type}
            onProgressUpdate={onStatusProgressUpdate}
          />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};
