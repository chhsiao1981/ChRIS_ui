import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { STATUS_OK } from "../api/constants";
import { createDataTag, getDataTags } from "../api/serverApi";
import type { DataTag } from "../api/types";

export const myClass = "chris-ui/data-tag";

const MUST_HAVE_TAGS = ["uploaded", "pacs"];

export interface State extends rState {
  tags: DataTag[];
}

export const defaultState: State = {
  tags: [],
};

export const init = (myID: string): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(_init({ myID, state: defaultState }));
  };
};

export const ensureTags = (myID: string, username: string): Thunk<State> => {
  return async (dispatch) => {
    for (const tag of MUST_HAVE_TAGS) {
      const { status, data, errmsg } = await getDataTags(username, tag);
      if (status !== STATUS_OK) {
        return;
      }
      if (errmsg) {
        return;
      }
      if (!data) {
        return;
      }
      if (data.length !== 0) {
        return;
      }

      console.info(
        "dataTag.ensureTags: to create data tag: username:",
        username,
        "tag:",
        tag,
      );
      await createDataTag(username, tag);
    }

    dispatch(fetchTags(myID, username));
  };
};

export const fetchTags = (myID: string, username: string): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data: newTags, errmsg } = await getDataTags(username);
    if (status !== STATUS_OK) {
      return;
    }
    if (errmsg) {
      return;
    }

    dispatch(setData(myID, { tags: newTags }));
  };
};
