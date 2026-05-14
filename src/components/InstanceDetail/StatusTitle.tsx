import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { ClockIcon } from "@patternfly/react-icons";
import FillCheckIcon from "@patternfly/react-icons/dist/esm/icons/check-icon";
import ExclaimationIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import React from "react";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { SpinContainer } from "../Common";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

const StatusTitle = ({ pluginStatus }: { pluginStatus: any }) => {
  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );

  const [classStatePluginInstance, _doPluginInstance] = usePluginInstance;

  const pluginInstance =
    getState(classStatePluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance: selected } = pluginInstance;

  let statusTitle:
    | {
        title: string;
        icon: any;
      }
    | undefined;

  const finishedStatuses = [
    "finishedSuccessfully",
    "finishedWithError",
    "cancelled",
  ];

  statusTitle =
    selected && finishedStatuses.includes(selected.status) === true
      ? getFinishedTitle(selected.status)
      : pluginStatus
        ? getCurrentTitleFromStatus(pluginStatus)
        : { title: "processing...", icon: ClockIcon };

  if (!pluginStatus && !statusTitle) {
    return <span>Failed to fetch status</span>;
  }

  if (statusTitle) {
    return (
      <>
        <span style={{ marginRight: "0.25em" }}>{<statusTitle.icon />}</span>
        <span>{statusTitle.title} </span>{" "}
      </>
    );
  }
  return <SpinContainer title="Fetching plugin's execution status" />;
};

const StatusTitleMemoed = React.memo(StatusTitle);
export default StatusTitleMemoed;

export function getCurrentTitleFromStatus(statusLabels: any[]) {
  const length = statusLabels.length;
  let title = statusLabels[length - 1].description;
  let icon = statusLabels[length - 1].icon;
  statusLabels.forEach((label) => {
    if (label.process === true) {
      title = label.description;
      icon = label.icon;
    }
  });

  return { title, icon };
}

export function getFinishedTitle(pluginStatus: string) {
  const title =
    pluginStatus === "finishedSuccessfully"
      ? "Finished Successfully"
      : pluginStatus === "cancelled"
        ? "Cancelled"
        : pluginStatus === "finishedWithError"
          ? "FinishedWithError"
          : "";
  const icon =
    pluginStatus === "finishedSuccessfully"
      ? FillCheckIcon
      : pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
        ? ExclaimationIcon
        : null;

  return {
    title,
    icon,
  };
}
