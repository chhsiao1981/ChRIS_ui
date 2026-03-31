import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import { createFeedWithFilepaths } from "../../api/serverApi";
import type { State } from "./state";

export const merge = (myID: string, feedName: string): Thunk<State> => {
  return async (dispatch, getClass) => {
    const theClass = getClass();
    const me = getState(theClass, myID);
    if (!me) {
      return;
    }

    const { selectedPaths } = me;
    const paths = selectedPaths.map((each) => each.path);

    console.info(
      "cart.merge: to createFeedWithFilePaths: feedName:",
      feedName,
      "paths:",
      paths,
    );

    const {
      status: _status,
      data: _data,
      errmsg,
    } = await createFeedWithFilepaths(paths, feedName);
    if (!errmsg) {
      dispatch(setData<State>(myID, { error: errmsg }));
      return;
    }
  };
};
