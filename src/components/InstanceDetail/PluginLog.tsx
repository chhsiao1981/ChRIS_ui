import { isEmpty } from "lodash";
import LogTerminal from "./LogTerminal";

type Props = {
  text?: string;
  log?: any;
  isHide: boolean;
};

export default (props: Props) => {
  const { text, log, isHide } = props;
  let terminalOutput = text ? text : "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} isHide={isHide} />;
};
