import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type React from "react";
import type { ReactNode } from "react";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { Dropdown, type MenuProps } from "../Antd";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  onZip: () => void;
  children?: ReactNode;
};
export default (props: Props) => {
  const { onZip, children } = props;

  const [classStatePluginInstance, _1] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstance =
    getState(classStatePluginInstance) || DoPluginInstance.defaultState;
  const { selectedPlugin } = pluginInstance;

  const [classStatePlugin, doPlugin] = useThunk<DoPlugin.State, TDoPlugin>(
    DoPlugin,
  );
  const pluginID = getRootID(classStatePlugin);

  const cancelled =
    selectedPlugin?.status === "cancelled" ||
    selectedPlugin?.status === "finishedWithError";

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Add a Child Node",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "2",
      label: "Add a Pipeline",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "3",
      label: "Add a Graph Node",
      disabled: true,
      icon: <AddIcon />,
    },
    {
      key: "4",
      label: "Delete a Node",
      disabled:
        selectedPlugin?.plugin_type === "fs" &&
        selectedPlugin?.plugin_name === "pl-dircopy",
      icon: <DeleteIcon />,
    },
    {
      key: "5",
      label: "Zip",
      icon: <PatternflyArchiveIcon />,
    },
  ];

  const handleOperations = (e: any) => {
    if (e.key === "1") {
      doPlugin.getNodeOperations(pluginID, "childNode");
    }
    if (e.key === "2") {
      doPlugin.getNodeOperations(pluginID, "childPipeline");
    }

    if (e.key === "3") {
      doPlugin.getNodeOperations(pluginID, "childGraph");
    }

    if (e.key === "4") {
      doPlugin.getNodeOperations(pluginID, "deleteNode");
    }

    if (e.key === "5") {
      onZip();
    }
  };

  const onMenuClick: MenuProps["onClick"] = (e) => {
    e.domEvent.stopPropagation();

    handleOperations(e);
  };

  const handleTouchEvent = (e: React.TouchEvent<HTMLUListElement>) => {
    e.stopPropagation();
    handleOperations(e);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const onLongPress: MenuProps["onTouchStart"] = (e) => {
    // Our mobile experience is horribly broken due to the drawers. This feature will be tested once that is in order
    e.preventDefault();
    // Open the dropdown on long press
    // You may adjust the duration based on your preference
    setTimeout(() => {
      // Open the dropdown
      handleTouchEvent(e);
    }, 500); // 500 milliseconds as an example duration for long press
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick: !isMobile ? onMenuClick : undefined,
        onTouchStart: isMobile ? onLongPress : undefined,
      }}
      open={true} // Force it to be open
    >
      {children}
    </Dropdown>
  );
};
