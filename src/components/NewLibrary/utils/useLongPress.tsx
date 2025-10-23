import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
  useRef,
  useState,
} from "react";
import * as DoCart from "../../../reducers/cart";
import type { PathType, PayloadType } from "../../../reducers/types";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

export default (useCart: UseThunk<DoCart.State, TDoCart>) => {
  const [classStateCart, doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const cartID = getRootID(classStateCart);
  const { selectedPaths } = cart;

  const [action, setAction] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track menu state
  const timerRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isLongPress = useRef(false);

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

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
    isLongPress.current = false;
    setAction("");
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

  const onClick = (
    e: MouseEvent | TouchEvent | KeyboardEvent,
    payload: PayloadType,
    pathForCart: string,
    pathType: PathType,
    callback?: () => void,
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
            selectFolder(pathForCart, pathType, payload);
          }
        } else if (e.type === "contextmenu") {
          e.preventDefault(); // Prevent the default context menu from appearing
          // First deselect all other items (unless holding Ctrl)
          if (!e.ctrlKey) {
            doCart.clearSelectedPaths(cartID);
          }
          // Always select the item that was right-clicked
          selectFolder(pathForCart, pathType, payload);
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
              selectFolder(pathForCart, pathType, payload);
            }
          }
        }
      } else if (clickCount.current === 2) {
        // Double click: Enter folder
        callback?.();
      }

      clickCount.current = 0;
    }, 300); // Adjust this delay as needed
    // Handle Ctrl + Click for selection
  };

  const onChangeCheckbox = (
    e: FormEvent<HTMLInputElement>,
    path: string,
    payload: PayloadType | null, // null is valid for deselection operations
    pathType: PathType,
  ) => {
    if (e.currentTarget.checked) {
      // For selection, we need a valid payload
      if (payload) {
        selectFolder(path, pathType, payload);
      }
    } else {
      // For deselection, we only need the path
      // The payload can be null in this case
      deselectFolder(path);
    }
  };

  const onMouseDown = () => {
    startPressTimer();
  };

  const onMouseUp = () => {
    clearPressTimer();
  };

  const onTouchStart = () => {
    startPressTimer();
  };

  const onTouchEnd = () => {
    if (action === "longpress") return;
    clearPressTimer();
  };

  return {
    action,
    handlers: {
      onClick,
      onMouseDown,
      onMouseUp,
      onTouchStart,
      onTouchEnd,
      onChangeCheckbox,
      isMenuOpen,
    },
  };
};
