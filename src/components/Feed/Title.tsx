import { Tooltip } from "@patternfly/react-core";
import { elipses } from "../../api/common";
import type { Feed } from "../../api/types";
import CustomTitle from "../FeedList/CustomTitle";
import { AnalysisIcon } from "../Icons";

type Props = {
  feed?: Feed;
};
export default (props: Props) => {
  const { feed } = props;
  const name = feed?.name || "";
  return (
    <CustomTitle color="white">
      <AnalysisIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={name}>
        <span>{elipses(name, 40)}</span>
      </Tooltip>
    </CustomTitle>
  );
};
