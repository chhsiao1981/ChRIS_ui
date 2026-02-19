import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type React from "react";
import { createContext, type ReactNode, useReducer } from "react";
import * as DoMainRouter from "../../../reducers/mainRouter";
import { createFeedReducer, getInitialState } from "../reducer/feedReducer";
import type { CreateFeedState } from "../types/feed";

type TDoMainRouter = ThunkModuleToFunc<typeof DoMainRouter>;

export const CreateFeedContext = createContext<{
  state: CreateFeedState;
  dispatch: React.Dispatch<any>;
}>({
  state: getInitialState(),
  dispatch: () => null,
});

type Props = {
  children: ReactNode;
};

export const CreateFeedProvider = (props: Props) => {
  const { children } = props;

  const useMainRouter = useThunk<DoMainRouter.State, TDoMainRouter>(
    DoMainRouter,
  );
  const [classStateMainRouter, _doMainRouter] = useMainRouter;
  const mainRouter = getState(classStateMainRouter);
  const initialState = getInitialState(mainRouter);
  const [state, dispatch] = useReducer(createFeedReducer, initialState);

  return (
    <CreateFeedContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateFeedContext.Provider>
  );
};
