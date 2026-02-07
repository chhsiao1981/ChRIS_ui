import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Tooltip } from "@patternfly/react-core";
import { useRef, useState } from "react";
import * as DoCart from "../../../reducers/cart";
import type { PayloadTypes } from "../../../store/cart/types";

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
  const { selectedPaths } = cart;

  const [action, setAction] = useState<string>();
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef<boolean>();

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

  // Common logic for handling contextmenu events
  const handleContextMenu = (
    e:
      | React.MouseEvent
      | React.TouchEvent
      | React.KeyboardEvent
      | React.PointerEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
  ) => {
    e.preventDefault();

    // Clear existing selections unless Ctrl is pressed (for multi-select)
    if (!e.ctrlKey) {
      doCart.clearAllPaths(cartID);
    }

    // Always select the item that was right-clicked
    selectFolder(pathForCart, type, payload);
  };

  // Common logic for handling Ctrl+Click
  function handleCtrlClick(
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
  ) {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );
    if (isExist) {
      deselectFolder(pathForCart);
    } else {
      selectFolder(pathForCart, type, payload);
    }
  }

  function handlePointerEvent(
    e: React.PointerEvent | React.KeyboardEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
    optionalCallback?: () => void,
  ) {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );

    // Handle special clicks (Ctrl+Click or context menu) immediately
    if (e.ctrlKey) {
      handleCtrlClick(payload, pathForCart, type);
      return;
    }

    if (e.type === "contextmenu") {
      handleContextMenu(e, payload, pathForCart, type);
      return;
    }

    // For both folders and files, use the double-click detection
    if (e.type === "pointerup") {
      // Skip processing if it's a right-click (right button = 2)
      if ("button" in e && e.button === 2) {
        return;
      }

      clickCount.current += 1;
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }

      clickTimer.current = setTimeout(() => {
        if (clickCount.current === 1) {
          // Single click - just toggle selection
          if (isExist) {
            deselectFolder(pathForCart);
          } else {
            selectFolder(pathForCart, type, payload);
          }
        } else if (clickCount.current === 2) {
          // Double click - execute callback (navigate or show detail view)
          if (optionalCallback) {
            optionalCallback();
          }
        }
        clickCount.current = 0;
      }, 200);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    // Only start timer for primary button (left-click)
    if (e.button === 0) {
      startPressTimer();

      // Use pointer capture only for left clicks, not right-clicks
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    clearPressTimer();

    // Only release capture for left-click to avoid interfering with context menu
    if (e.button === 0 && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handlePointerCancel(e: React.PointerEvent) {
    clearPressTimer();

    // Only release capture don't do any deselection
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Keep original handleOnClick specifically for context menu
  function handleOnClick(
    e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
    payload: PayloadTypes,
    pathForCart: string,
    type: string,
    optionalCallback?: () => void,
  ) {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );

    // Handle special clicks (Ctrl+Click or context menu) immediately
    if (e.ctrlKey) {
      handleCtrlClick(payload, pathForCart, type);
      return;
    }

    if (e.type === "contextmenu") {
      handleContextMenu(e, payload, pathForCart, type);
      return;
    }

    // For regular clicks, use pointerEvent instead (this part won't actually be used)
    clickCount.current += 1;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        // Single click - just toggle selection
        if (isExist) {
          deselectFolder(pathForCart);
        } else {
          selectFolder(pathForCart, type, payload);
        }
      } else if (clickCount.current === 2) {
        // Double click - execute callback (navigate or show detail view)
        if (optionalCallback) {
          optionalCallback();
        }
      }
      clickCount.current = 0;
    }, 200);
  }

  return {
    action,
    handlers: {
      handlePointerEvent,
      handlePointerDown,
      handlePointerUp,
      handlePointerCancel,
      handleOnClick,
    },
  };
};

export function getBackgroundRowColor(
  isSelected: boolean,
  isDarkTheme: boolean,
) {
  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow = "inherit";
  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  return selectedBgRow;
}

export function TitleNameClipped({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  const clippedName = elipses(name, value);

  return (
    <Tooltip content={name}>
      <span>{clippedName}</span>
    </Tooltip>
  );
}
