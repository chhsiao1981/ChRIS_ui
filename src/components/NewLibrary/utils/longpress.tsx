import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Tooltip } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
import * as DoCart from "../../../reducers/cart";
import type { PayloadTypes } from "../../../store/cart/types";
import { FolderIcon } from "../../Icons";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

export const elipses = (str: string, len: number) => {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
};

export default () => {
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;

  const [action, setAction] = useState<string>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Track menu state
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef<boolean>();
  const { selectedPaths } = cart;

  const startPressTimer = () => {
    isLongPress.current = false;
    //@ts-expect-error
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setAction("longpress");
    }, 600);
  };

  const clearPressTimer = () => {
    clearTimeout(timerRef.current);
  };

  const selectFolder = (pathForCart: string, type: string, payload: any) => {
    doCart.setSelectedPaths(cartID, { path: pathForCart, type, payload });
  };

  const deselectFolder = (pathForCart: string) => {
    doCart.clearSelectedPaths(cartID, pathForCart);
  };

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const handleOnClick = (
    e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
    optionalCallback?: () => void,
  ) => {
    const isExist = selectedPaths.some((item) => item.path === pathForCart);

    clickCount.current += 1;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        // Single click
        if (e.ctrlKey) {
          // Ctrl + Click: Toggle selection
          if (isExist) {
            deselectFolder(pathForCart);
          } else {
            selectFolder(pathForCart, type, payload);
          }
        } else if (e.type === "contextmenu") {
          e.preventDefault(); // Prevent the default context menu from appearing
          // First deselect all other items (unless holding Ctrl)
          if (!e.ctrlKey) {
            doCart.clearAllPaths(cartID);
          }
          // Always select the item that was right-clicked
          selectFolder(pathForCart, type, payload);
          // No need to manage menu state here - the Dropdown component in ContextMenu.tsx handles it
        } else {
          if (isMenuOpen) {
            // The context menu is also closed by a right click
            // We don't want it to confuse it with select/deselect of a folder
            setIsMenuOpen(false);
          } else {
            // Normal click: Select/Deselect
            if (isExist) {
              deselectFolder(pathForCart);
            } else {
              selectFolder(pathForCart, type, payload);
            }
          }
        }
      } else if (clickCount.current === 2) {
        // Double click: Enter folder
        optionalCallback?.();
      }

      clickCount.current = 0;
    }, 300); // Adjust this delay as needed
    // Handle Ctrl + Click for selection
  };

  const handleCheckboxChange = (
    e: React.FormEvent<HTMLInputElement>,
    path: string,
    payload:
      | (FileBrowserFolder | FileBrowserFolderFile | FileBrowserFolderLinkFile)
      | null, // null is valid for deselection operations
    type: string,
  ) => {
    if (e.currentTarget.checked) {
      // For selection, we need a valid payload
      if (payload) {
        selectFolder(path, type, payload);
      }
    } else {
      // For deselection, we only need the path
      // The payload can be null in this case
      deselectFolder(path);
    }
  };

  const handleOnMouseDown = () => {
    startPressTimer();
  };

  const handleOnMouseUp = () => {
    clearPressTimer();
  };

  const handleOnTouchStart = () => {
    startPressTimer();
  };

  const handleOnTouchEnd = () => {
    if (action === "longpress") return;
    clearPressTimer();
  };

  return {
    action,
    handlers: {
      handleOnClick,
      handleOnMouseDown,
      handleOnMouseUp,
      handleOnTouchStart,
      handleOnTouchEnd,
      handleCheckboxChange,
      isMenuOpen,
    },
  };
};

export const getBackgroundRowColor = (
  isSelected: boolean,
  isDarkTheme: boolean,
) => {
  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow = "inherit";
  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  return selectedBgRow;
};

export const TitleNameClipped = ({
  name,
  value,
}: {
  name: string;
  value: number;
}) => {
  const clippedName = elipses(name, value);

  return (
    <Tooltip content={name}>
      <span>{clippedName}</span>
    </Tooltip>
  );
};

export const ShowInFolder = ({
  path,
  isError,
}: {
  path: string;
  isError: boolean;
}) => {
  const navigate = useNavigate();
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);

  const onClick = () => {
    navigate(`/library/${path}`);
    // Close the cart once the user wants to navigate away
    doCart.setToggleCart(cartID);
  };
  return (
    <Tooltip content={"Show in Folder"}>
      <Button
        isDisabled={isError}
        onClick={onClick}
        variant="link"
        icon={<FolderIcon />}
      />
    </Tooltip>
  );
};

export const fetchFeedForPath = async (path: string): Promise<Feed | null> => {
  const feedMatches = path.match(/feed_(\d+)/);
  const id = feedMatches ? feedMatches[1] : null;

  if (id) {
    const client = ChrisAPIClient.getClient();
    const feed: Feed = (await client.getFeed(Number(id))) as Feed;
    if (!feed) throw new Error("Failed to fetch the feed");
    return feed;
  }
  return null;
};

export const useAssociatedFeed = (folderPath: string) => {
  const feedMatches = folderPath.match(/feed_(\d+)/);

  return useQuery({
    queryKey: ["associatedFeed", folderPath],
    queryFn: async () => {
      const id = feedMatches ? feedMatches[1] : null;
      if (id) {
        const client = ChrisAPIClient.getClient();
        const feed = await client.getFeed(Number(id));
        if (!feed) throw new Error("Failed to fetch the feed");
        return feed.data.name;
      }
      return null;
    },
    enabled: Boolean(feedMatches?.length),
  });
};

export const formatBytesWithPadding = (bytes: number): string => {
  if (bytes === 0) return "  0.00 B ";
  const k = 1024;
  const dm = 2; // Decimal places
  const sizes = [" B ", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNumber = (bytes / k ** i).toFixed(dm).padStart(6, " ");
  return `${formattedNumber} ${sizes[i]}`;
};
