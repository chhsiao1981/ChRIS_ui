import { Button, Text, Tooltip } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { elipses } from "../../../../api/common";
import type { DownloadStatus } from "../../../../reducers/types";
import { DotsIndicator } from "../../../Common";

type Props = {
  currentStatus: DownloadStatus;
};
export default (props: Props) => {
  const { currentStatus } = props;
  const { step, error } = currentStatus;
  switch (step) {
    case "started":
      return <DotsIndicator title="" />;
    case "finished":
      return (
        <Button
          variant="plain"
          icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
        />
      );
    case "cancelled":
      return (
        <Tooltip content={error}>
          <Text>{error ? elipses(error, 45) : "Uncaught error"}</Text>
        </Tooltip>
      );
    default:
      return <DotsIndicator title={step} />;
  }
};
