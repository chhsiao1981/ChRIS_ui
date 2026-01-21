import config from "config";
import api from "../api";
import { STATUS_OK } from "../constants";
import type { AuthToken, User, UserInfo } from "../types";
import type { UserAuthToken } from "../types/user";
import { getLinkMap } from "./misc";

export const createUser = (username: string, password: string, email: string) =>
  api<User>({
    endpoint: "/users/",
    apiroot: config.USER_ROOT,
    json: {
      username,
      password,
      email,
    },
    method: "post",
    isSignUpLogin: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getAuthToken = (username: string, password: string) =>
  api<AuthToken>({
    endpoint: "/auth-token/",
    apiroot: config.AUTH_ROOT,
    json: {
      username,
      password,
    },
    method: "post",
    isSignUpLogin: true,
    isJson: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUserID = async (): Promise<string> => {
  const { status, data, errmsg } = await getLinkMap();
  if (!data) {
    return "";
  }
  if (status !== STATUS_OK) {
    return "";
  }

  const userLink = data.user;
  if (!userLink) {
    return "";
  }
  const userLinkList = userLink.split("/");
  return userLinkList[userLinkList.length - 2];
};

export const getUser = (userID: string) =>
  api<User>({
    endpoint: `/users/${userID}/`,
  });

/*****
 * /api/v7
 *****/
export const getUserInfo = () =>
  api<UserInfo>({
    endpoint: `/users/me`,
    apiroot: config.API_V7_ROOT,
    isJson: true,
  });

export const oidcRedirect = (queryString: string) =>
  api<UserAuthToken>({
    endpoint: "/auth/oidc-redirect",
    queryString,
    apiroot: config.OIDC_ROOT,
    isJson: true,
  });
