import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type React from "react";
import type { ReactNode } from "react";
import * as DoPlugin from "../../reducers/pkg";
import { NodeOperation } from "../../reducers/types";
import { useAppSelector } from "../../store/hooks";
import { Dropdown, type MenuProps } from "../Antd";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;

type Props = {
  onZip: () => void;
  children?: ReactNode;
  usePlugin: UseThunk<DoPlugin.State, TDoPlugin>;
};
export default (props: Props) => {
  const { onZip, children, usePlugin } = props;
  const [classStatePlugin, doPlugin] = usePlugin;
  const pluginID = getRootID(classStatePlugin);
  const plugin = getState(classStatePlugin) || DoPlugin.defaultState;
  const { nodeOperations } = plugin;

  const { selectedPlugin } = useAppSelector((state) => {
    return state.instance;
  });
  const cancelled =
    selectedPlugin?.data.status === "cancelled" ||
    selectedPlugin?.data.status === "finishedWithError";
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Add a Child Node",
      icon: <AddIcon />,
      disabled: cancelled || !nodeOperations[NodeOperation.ChildNode],
    },
    {
      key: "2",
      label: "Add a Pipeline",
      icon: <AddIcon />,
      disabled: cancelled || !nodeOperations[NodeOperation.ChildPipeline],
    },
    {
      key: "3",
      label: "Add a Graph Node",
      disabled: !nodeOperations[NodeOperation.GraphNode],
      icon: <AddIcon />,
    },
    {
      key: "4",
      label: "Delete a Node",
      disabled:
        (selectedPlugin?.data.plugin_type === "fs" &&
          selectedPlugin?.data.plugin_name === "pl-dircopy") ||
        !nodeOperations[NodeOperation.DeleteNode],
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
      doPlugin.toggleNodeOperation(pluginID, NodeOperation.ChildNode);
    }
    if (e.key === "2") {
      doPlugin.toggleNodeOperation(pluginID, NodeOperation.ChildPipeline);
    }

    if (e.key === "3") {
      doPlugin.toggleNodeOperation(pluginID, NodeOperation.GraphNode);
    }

    if (e.key === "4") {
      doPlugin.toggleNodeOperation(pluginID, NodeOperation.DeleteNode);
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
