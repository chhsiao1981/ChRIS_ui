import {
  getRootID,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactElement, useContext, useRef } from "react";
import * as DoCart from "../../../reducers/cart";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

export enum OperationContext {
  LIBRARY = "library",
  FEEDS = "feeds",
  FILEBROWSER = "fileBrowser",
}

export interface OriginState {
  type: OperationContext;
  additionalKeys: string[];
}

interface OperationsContextType {
  invalidateQueries: () => void;
  handleOrigin: (origin: OriginState) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(
  undefined,
);

export const useOperationsContext = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error(
      "useOperationsContext must be used within an OperationsProvider",
    );
  }
  return context;
};

type Props = {
  children: ReactElement;
};

export const OperationsProvider = (props: Props) => {
  const { children } = props;
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);

  const queryClient = useQueryClient();
  const originRef = useRef<OriginState>();

  const handleOrigin = (newOrigin: OriginState) => {
    originRef.current = newOrigin;
  };

  const invalidateQueries = () => {
    // Helps to reset the page when operations are performed
    const additionalKeys = originRef.current?.additionalKeys || [];
    const type = originRef.current?.type;

    if (!type) return;

    doCart.clearAllPaths(cartID);

    switch (type) {
      case OperationContext.LIBRARY:
        queryClient.refetchQueries({
          queryKey: ["library_folders", ...additionalKeys],
        });
        break;

      case OperationContext.FEEDS:
        queryClient.refetchQueries({
          queryKey: ["feeds", ...additionalKeys],
        });
        break;
      case OperationContext.FILEBROWSER:
        queryClient.refetchQueries({
          queryKey: ["pluginFiles", ...additionalKeys],
        });
    }
  };

  return (
    <OperationsContext.Provider value={{ invalidateQueries, handleOrigin }}>
      {children}
    </OperationsContext.Provider>
  );
};
