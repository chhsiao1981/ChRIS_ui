import {
  init as _init,
  type DispatchFuncMap,
  getState,
  type State as rState,
  setData,
  type Thunk,
  type ThunkModuleToFunc,
} from "@chhsiao1981/use-thunk";
import user from "@fnndsc/chrisapi/dist/types/user";
import queryString from "query-string";
import { Cookies } from "react-cookie";
import { refreshCookie } from "../api/api";
import { STATUS_OK } from "../api/constants";
import {
  createUser as apiCreateUser,
  oidcRedirect as apiOIDCRedirect,
  getAuthToken,
  getUser,
  getUserID,
  getUserInfo,
} from "../api/serverApi";
import type { User } from "../api/types/user";
import type * as DoDataTag from "./dataTag";
import { Role } from "./types";

type TDoDataTag = ThunkModuleToFunc<typeof DoDataTag>;

export const myClass = "chris-ui/user";

export interface State extends rState {
  username: string;
  email: string;
  token: string;

  isRememberMe: boolean;
  isLoggedIn: boolean;
  isStaff: boolean;

  role: Role;

  isInit: boolean;

  errmsg?: string;
}

export const defaultState: State = {
  username: "",
  email: "",
  token: "",

  isRememberMe: false,
  isLoggedIn: false,
  isStaff: false,

  isInit: false,

  role: Role.Guest,
};

export const init = (
  dataTagID: string,
  doDataTag: DispatchFuncMap<DoDataTag.State, TDoDataTag>,
): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data: user } = await getUserInfo();
    console.info(
      "user.init: after getUserInfo: status:",
      status,
      "user:",
      user,
    );
    if (status !== 200) {
      return;
    }
    if (!user) {
      return;
    }

    const state: State = Object.assign({}, defaultState, {
      username: user.username,
      isStaff: user.is_admin || false,
      role: Role.Researcher,
      isInit: true,
      isLoggedIn: true,
    });

    console.info("user.init: to _init state:", state);
    dispatch(_init({ state }));
    doDataTag.ensureTags(dataTagID, user.username);
  };
};

export const oidcRedirect = (
  myID: string,
  queryString: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const ret = await apiOIDCRedirect(queryString);
    console.info("user.oidcRedirect: ret:", ret);
  };
};

export const loginLegacy = (
  myID: string,
  username: string,
  password: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    if (!username) {
      dispatch(setData(myID, { errmsg: "Invalid Credentials" }));
      return;
    }

    const { status, data, errmsg } = await getAuthToken(username, password);
    if (errmsg) {
      dispatch(setData(myID, { errmsg }));
      return;
    }
    if (!data) {
      dispatch(setData(myID, { errmsg: "unable to get data" }));
      return;
    }

    const { token } = data;

    if (!token || !username) {
      dispatch(setData(myID, { errmsg: "Invalid Credentials" }));
      return;
    }

    const cookie = new Cookies();
    const options = { path: "/", maxAge: 86400 };
    cookie.set(`${username}_token`, token, options);
    cookie.set("username", username, options);
    refreshCookie();

    const userID = await getUserID();
    if (!userID) {
      dispatch(setData(myID, { errmsg: "Unable to get user id" }));
      return;
    }

    const {
      status: status2,
      data: data2,
      errmsg: errmsg2,
    } = await getUser(userID);
    if (status !== STATUS_OK) {
      dispatch(setData(myID, { errmsg: "Unable to get user info" }));
      return;
    }
    if (!data2) {
      dispatch(setData(myID, { errmsg: "Unable to get user info" }));
      return;
    }

    const { is_staff: isStaff } = data2;
    cookie.set("isStaff", isStaff, options);
    refreshCookie();

    dispatch(setAuthTokenSuccess(myID, token, username, isStaff));

    const { redirectTo: propsRedirectTo } = queryString.parse(
      window.location.search,
    ) as {
      redirectTo: string;
    };

    const redirectTo = propsRedirectTo || "/";
    const decodedRedirectTo = decodeURIComponent(redirectTo);
    window.location.href = decodedRedirectTo;
  };
};

export const setAuthTokenSuccess = (
  myID: string,
  token: string,
  username: string,
  isStaff: boolean,
): Thunk<State> => {
  return async (dispatch, _) => {
    const role = isStaff ? Role.Admin : Role.Researcher;
    const toUpdate = { token, username, isStaff, role, isLoggedIn: true };
    dispatch(setData(myID, toUpdate));
  };
};

export const setRole = (myID: string, role: Role): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const state = getState(classState, myID);
    if (!state) {
      return;
    }
    if (!state.isStaff && role === Role.Admin) {
      return;
    }
    dispatch(setData(myID, { role }));
  };
};

export const logout = (myID: string): Thunk<State> => {
  return async (_, getClassState) => {
    const classState = getClassState();
    const state = getState(classState, myID);
    if (!state) {
      return;
    }

    const cookie = new Cookies();
    cookie.remove("chris_token");
    refreshCookie();

    window.location.href = "/";
  };
};

export const createUser = (
  myID: string,
  username: string,
  password: string,
  email: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const {
      status,
      data: user,
      errmsg,
    } = await apiCreateUser(username, password, email);

    const {
      status: status2,
      data,
      errmsg: errmsg2,
    } = await getAuthToken(username, password);

    if (!data) {
      return;
    }
    const { token } = data;

    if (!user || !token) {
      return;
    }

    const { username: username2, is_staff: isStaff } = user;

    const cookie = new Cookies();
    const options = { path: "/", maxAge: 86400 };
    cookie.set(`${username2}_token`, token, options);
    cookie.set("username", username2, options);
    cookie.set("isStaff", isStaff, options);
    refreshCookie();

    dispatch(setAuthTokenSuccess(myID, token, username2, isStaff));

    const theThen = new URLSearchParams(location.search).get("then");

    if (theThen) {
      window.location.href = theThen;
    } else {
      window.location.href = "/";
    }
  };
};
