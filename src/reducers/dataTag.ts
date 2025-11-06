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

type TagMap = { [name: string]: DataTag };
export interface State extends rState {
  tags: string[];
  tagMap: TagMap;
}

export const defaultState: State = {
  tags: [],
  tagMap: {},
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
        dispatch(fetchTags(myID, username));
        return;
      }
      if (data.length !== 0) {
        dispatch(fetchTags(myID, username));
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

    if (!newTags) {
      return;
    }

    const sortedNewTags = newTags.sort((a, b) => b.id - a.id);
    const tagMap = sortedNewTags.reduce((r: TagMap, each: DataTag) => {
      r[each.name] = each;
      return r;
    }, {});

    const tags = Object.keys(tagMap);

    dispatch(setData(myID, { tags, tagMap }));
  };
};
