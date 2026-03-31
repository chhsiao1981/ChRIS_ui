import { elipses } from "../../../../api/common";
import { FEED_NAME_LENGTH } from "../../../../constants";
import type { CartSelection } from "../../../../reducers/types";

export const getMergeNameFromSelections = (selections: CartSelection[]) => {
  const feedNames = selections.map((selection) => selection.name);

  const feedName = feedNames.join(",");
  return elipses(feedName, FEED_NAME_LENGTH);
};
