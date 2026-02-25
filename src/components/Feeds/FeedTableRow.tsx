import { getState, type UseThunk } from "@chhsiao1981/use-thunk";
import { Td, Tr } from "@patternfly/react-table";
import { format } from "path";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Feed, FileBrowserFolder } from "../../api/types";
import { ThemeContext } from "../DarkTheme/useTheme";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import { OperationContext } from "../NewLibrary/context";
import FeedInfoColumn from "./FeedInfoColumn";

// -------------- TableRow Props --------------
type TableRowProps = {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  type: string;
  additionalKeys: string[];
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

const TableRow = (props: TableRowProps) => {
  const { rowIndex, feed, additionalKeys, type, username, useCart } = props;

  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
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

  /**
   * Handle feed name click
   */
  const onFeedNameClick = () => {
    navigate(`/data/${feed.id}?type=${feed.public ? "public" : "private"}`);
  };

  return (
    <FolderContextMenu
      username={username}
      origin={{
        type: OperationContext.FEEDS,
        additionalKeys: additionalKeys,
      }}
    >
      <Tr
        key={feed.id}
        id={`feed-row-${feed.id}`}
        style={{ backgroundColor: selectedBgRow, cursor: "pointer" }}
        data-test-id={`${feed.name}-test`}
        onContextMenu={async (e) => {
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.folder_path, "folder");
        }}
        onClick={async (e) => {
          e?.stopPropagation();
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.folder_path, "folder", () => {
            onFeedNameClick();
          });
        }}
        isRowSelected={isSelected}
      >
        <Td
          onClick={(e) => e.stopPropagation()}
          select={{
            rowIndex: rowIndex,
            isSelected: isSelected,
            onSelect: async (event) => {
              event.stopPropagation();
              const isChecked = event.currentTarget.checked;

              // Only fetch folder data if the checkbox is being checked
              // This prevents the delay when simply rendering checkboxes
              let payload: FileBrowserFolder | null = null;
              if (isChecked) {
                payload = await getFolderForThisFeed();
              } else if (isSelected) {
                // If unchecking, we don't need to fetch again, just use the path
                handlers.handleCheckboxChange(
                  event,
                  feed.folder_path,
                  null,
                  "folder",
                );
                return;
              }

              /**
               * Create a new event object with the captured value
               */
              const newEvent = {
                ...event,
                stopPropagation: () => event.stopPropagation(),
                preventDefault: () => event.preventDefault(),
                target: {
                  ...event.currentTarget,
                  checked: isChecked,
                },
                // Make sure currentTarget also has the checked property
                currentTarget: {
                  ...event.currentTarget,
                  checked: isChecked,
                },
              };

              handlers.handleCheckboxChange(
                newEvent as unknown as React.FormEvent<HTMLInputElement>,
                feed.folder_path,
                payload,
                "folder",
              );
            },
          }}
        />
        <Td dataLabel="ID">{feed.id}</Td>
        <Td dataLabel="analysis">
          <FeedInfoColumn feed={feed} onClick={onFeedNameClick} />
        </Td>
        <Td dataLabel="created">
          {format(new Date(feed.creation_date), "dd MMM yyyy, HH:mm")}
        </Td>
        <Td dataLabel="creator">{feed.owner_username}</Td>
        {/* Status column with progress donut */}
        <Td dataLabel="status">
          <DonutUtilization
            feed={feed}
            type={type}
            onProgressUpdate={(progress, error) => {
              setRowProgress(progress);
              setRowError(error);
            }}
          />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};
