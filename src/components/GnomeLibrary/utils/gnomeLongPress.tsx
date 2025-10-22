import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type TouchEvent,
  useRef,
  useState,
} from "react";
import * as DoCart from "../../../reducers/cart";
import type { PathType, PayloadType } from "../../../reducers/types";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  useCart: UseThunk<DoCart.State, TDoCart>;
};
export default (props: Props) => {
  const { useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const cartID = getRootID(classStateCart);
  const [action, setAction] = useState<string>();
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef<boolean>();
  const { selectedPaths } = cart;

  const startPressTimer = () => {
    isLongPress.current = false;
    //@ts-ignore
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setAction("longpress");
    }, 600);
  };

  const clearPressTimer = () => {
    if (!timerRef.current) {
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const selectFolder = (
    pathForCart: string,
    pathType: PathType,
    payload: PayloadType,
  ) => {
    doCart.addSelectedPath(cartID, {
      path: pathForCart,
      type: pathType,
      payload,
    });
  };

  const deselectFolder = (pathForCart: string) => {
    doCart.removeSelectedPath(cartID, pathForCart);
  };

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  // Common logic for handling contextmenu events
  const onContextMenu = (
    e: MouseEvent | TouchEvent | KeyboardEvent | PointerEvent,
    payload: PayloadType,
    pathForCart: string,
    pathType: PathType,
  ) => {
    e.preventDefault();

    // Clear existing selections unless Ctrl is pressed (for multi-select)
    if (!e.ctrlKey) {
      doCart.clearSelectedPaths(cartID);
    }

    // Always select the item that was right-clicked
    selectFolder(pathForCart, pathType, payload);
  };

  // Common logic for handling Ctrl+Click
  const onCtrlClick = (
    payload: PayloadType,
    pathForCart: string,
    pathType: PathType,
  ) => {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );
    if (isExist) {
      deselectFolder(pathForCart);
    } else {
      selectFolder(pathForCart, pathType, payload);
    }
  };

  const onPointerEvent = (
    e: PointerEvent | KeyboardEvent,
    payload: PayloadType,
    pathForCart: string,
    pathType: PathType,
    callback?: () => void,
  ) => {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );

    // Handle special clicks (Ctrl+Click or context menu) immediately
    if (e.ctrlKey) {
      onCtrlClick(payload, pathForCart, pathType);
      return;
    }

    if (e.type === "contextmenu") {
      onContextMenu(e, payload, pathForCart, pathType);
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
            selectFolder(pathForCart, pathType, payload);
          }
        } else if (clickCount.current === 2) {
          // Double click - execute callback (navigate or show detail view)
          if (callback) {
            callback();
          }
        }
        clickCount.current = 0;
      }, 200);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    // Only start timer for primary button (left-click)
    if (e.button === 0) {
      startPressTimer();

      // Use pointer capture only for left clicks, not right-clicks
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    clearPressTimer();

    // Only release capture for left-click to avoid interfering with context menu
    if (e.button === 0 && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onPointerCancel = (e: PointerEvent) => {
    clearPressTimer();

    // Only release capture don't do any deselection
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Keep original handleOnClick specifically for context menu
  const onClick = (
    e: MouseEvent | TouchEvent | KeyboardEvent,
    payload: PayloadType,
    pathForCart: string,
    pathType: PathType,
    callback?: () => void,
  ) => {
    const isExist = selectedPaths.some(
      (item) => item.payload.data.id === payload.data.id,
    );

    // Handle special clicks (Ctrl+Click or context menu) immediately
    if (e.ctrlKey) {
      onCtrlClick(payload, pathForCart, pathType);
      return;
    }

    if (e.type === "contextmenu") {
      onContextMenu(e, payload, pathForCart, pathType);
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
          selectFolder(pathForCart, pathType, payload);
        }
      } else if (clickCount.current === 2) {
        // Double click - execute callback (navigate or show detail view)
        if (callback) {
          callback();
        }
      }
      clickCount.current = 0;
    }, 200);
  };

  return {
    action,
    handlers: {
      handlePointerEvent: onPointerEvent,
      handlePointerDown: onPointerDown,
      handlePointerUp: onPointerUp,
      handlePointerCancel: onPointerCancel,
      handleOnClick: onClick,
    },
  };
};
