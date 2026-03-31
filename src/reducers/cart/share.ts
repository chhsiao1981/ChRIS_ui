import { getState, setData, type Thunk } from "@chhsiao1981/use-thunk";
import { updateFeedPublic } from "../../api/serverApi";
import { addFeedUserPermission } from "../../api/serverApi/feed";
import type { Feed } from "../../api/types";
import { clearAllPaths } from "./selected";
import type { State } from "./state";

export const share = (
  myID: string,
  targetUsername: string,
  isPublic: boolean,
): Thunk<State> => {
  return async (dispatch, getClass) => {
    console.info(
      "cart.share: start: myID:",
      myID,
      "targetUsername:",
      targetUsername,
      "isPublic:",
      isPublic,
    );
    const classState = getClass();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }
    const { selectedPaths } = me;

    for (const eachSelected of selectedPaths) {
      if (eachSelected.type === "feed") {
        const feed = eachSelected.rawData as Feed;
        const { errmsg } = await shareFeed(
          myID,
          feed,
          targetUsername,
          isPublic,
        );
        if (errmsg) {
          dispatch(setData<State>(myID, { error: errmsg }));
        }
      }
    }
    dispatch(clearAllPaths(myID));
  };
};

const shareFeed = async (
  myID: string,
  feed: Feed,
  targetUsername: string,
  isPublic: boolean,
) => {
  if (isPublic) {
    return await updateFeedPublic(feed.id, isPublic);
  }

  return await addFeedUserPermission(feed.id, targetUsername);
};
