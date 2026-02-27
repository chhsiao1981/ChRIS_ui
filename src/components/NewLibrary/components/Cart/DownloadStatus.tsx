import { Button, Text, Tooltip } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import {
  type DownloadStatusObject,
  DownloadTypes,
} from "../../../../reducers/types";
import { DotsIndicator } from "../../../Common";
import { elipses } from "../../utils/longpress";

type Props = {
  currentStatus: DownloadStatusObject;
};
export default (props: Props) => {
  const { currentStatus } = props;
  const { step, error } = currentStatus;
  switch (step) {
    case DownloadTypes.started:
      return <DotsIndicator title="" />;
    case DownloadTypes.finished:
      return (
        <Button
          variant="plain"
          icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
        />
      );
    case DownloadTypes.cancelled:
      return (
        <Tooltip content={error}>
          <Text>{error ? elipses(error, 45) : "Uncaught error"}</Text>
        </Tooltip>
      );
    default:
      return <DotsIndicator title={step} />;
  }
};
