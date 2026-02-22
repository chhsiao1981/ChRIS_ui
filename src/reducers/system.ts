import {
  init as _init,
  genUUID,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { STATUS_OK } from "../api/constants";
import { getSystemInfo } from "../api/serverApi/system";

// This is actually the sidebar UI.
export const myClass = "chris-ui/system";

export interface State extends rState {
  version: string;
  isAllowRegister: boolean;
  err?: Error;
}

export const defaultState: State = {
  version: "",
  isAllowRegister: false,
};

export const init = (): Thunk<State> => {
  return async (dispatch, _) => {
    const myID = genUUID();
    dispatch(_init({ myID, state: defaultState }));
    const { status, data: systemInfo, errmsg } = await getSystemInfo();
    if (status !== STATUS_OK) {
      dispatch(
        setData<State>(myID, {
          err: new Error(`unable to get system info: e: ${errmsg}`),
        }),
      );
      return;
    }
    if (!systemInfo) {
      dispatch(
        setData<State>(myID, {
          err: new Error(`unable to get system info: (no systemInfo)`),
        }),
      );
      return;
    }

    const toUpdate: Partial<State> = {
      version: systemInfo.version,
      isAllowRegister: systemInfo.is_allow_register,
    };
    dispatch(setData<State>(myID, toUpdate));
  };
};

export const clearError = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData<State>(myID, { err: undefined }));
  };
};
