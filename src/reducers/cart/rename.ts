import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import { updateFeedName } from "../../api/serverApi";
import type { Feed } from "../../api/types";
import type { State } from "./state";

export const rename = (myID: string, name: string): Thunk<State> => {
  return async (dispatch, getClass) => {
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { selectedPaths } = me;
    if (!selectedPaths.length) {
      return;
    }

    const selected = selectedPaths[0];
    const feed = selected.rawData as Feed;
    const { status, data, errmsg } = await updateFeedName(feed.id, name);
    if (errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
  };
};
