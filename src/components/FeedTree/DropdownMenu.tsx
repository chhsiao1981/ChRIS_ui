import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type { ItemType } from "antd/es/menu/interface";
import type { ReactNode } from "react";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { Dropdown, type MenuProps } from "../Antd";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";
import type { TreeNodeDatum } from "./data";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  node: TreeNodeDatum | null;
  close: () => void;
  children?: ReactNode;
  isVisible: boolean;
};
export default (props: Props) => {
  // XXX onTouchStart not working for now.
  const { node, close, children, isVisible } = props;

  const [classPluginInstance, _1] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance } = pluginInstance;

  const [classPlugin, doPlugin] = useThunk<DoPlugin.State, TDoPlugin>(DoPlugin);
  const pluginID = getDefaultID(classPlugin);

  const cancelled =
    selectedInstance?.status === "cancelled" ||
    selectedInstance?.status === "finishedWithError";

  const items: ItemType[] = [
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
    /*
    {
      key: "3",
      label: "Add a Graph Node",
      disabled: true,
      icon: <AddIcon />,
    },
    */
    {
      key: "4",
      label: "Delete a Node",
      disabled:
        selectedInstance?.plugin_type === "fs" &&
        selectedInstance?.plugin_name === "pl-dircopy",
      icon: <DeleteIcon />,
    },
    {
      key: "5",
      label: "Zip",
      icon: <PatternflyArchiveIcon />,
    },
  ];

  const onZip = () => {
    if (!node) {
      return;
    }
    fetchPipeline(node.item);
    close();
  };

  const onOperations = (e: any) => {
    if (e.key === "1") {
      doPlugin.getNodeOperations(pluginID, "childNode");
    }
    if (e.key === "2") {
      doPlugin.getNodeOperations(pluginID, "childPipeline");
    }

    if (e.key === "4") {
      doPlugin.getNodeOperations(pluginID, "deleteNode");
    }

    if (e.key === "5") {
      onZip();
    }
  };

  const onClick: MenuProps["onClick"] = (e) => {
    e.domEvent.stopPropagation();

    onOperations(e);
  };

  // XXX onTouch not working for now.
  /*
  const onTouchEvent = (e: TouchEvent<HTMLUListElement>) => {
    e.stopPropagation();
    onOperations(e);
  };

  const onLongPress: MenuProps["onTouchStart"] = (e) => {
    // Our mobile experience is horribly broken due to the drawers. This feature will be tested once that is in order
    e.preventDefault();
    // Open the dropdown on long press
    // You may adjust the duration based on your preference
    setTimeout(() => {
      // Open the dropdown
      onTouchEvent(e);
    }, 500); // 500 milliseconds as an example duration for long press
  };
  */

  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      open={isVisible} // Force it to be open
    >
      {children}
    </Dropdown>
  );
};
