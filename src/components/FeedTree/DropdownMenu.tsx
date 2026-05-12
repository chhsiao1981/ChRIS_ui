import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type { ItemType } from "antd/es/menu/interface";
import { type CSSProperties, type ReactNode, useState } from "react";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import AddNode from "../AddNode/AddNode";
import AddPipeline from "../AddPipeline/AddPipeline";
import { Dropdown, type MenuProps } from "../Antd";
import DeleteNode from "../DeleteNode";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";
import styles from "./DropdownMenu.module.css";
import type { DropdownOperation, DropdownPosition } from "./types";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  close: () => void;
  children?: ReactNode;
  isVisible: boolean;
  position: DropdownPosition;
};

export default (props: Props) => {
  // XXX onTouchStart not working for now.
  const { close, children, isVisible, position } = props;

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
      key: "addNode",
      label: "Add a Child Node",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "addPipeline",
      label: "Add a Pipeline",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "deleteNode",
      label: "Delete a Node",
      disabled:
        selectedInstance?.plugin_type === "fs" &&
        selectedInstance?.plugin_name === "pl-dircopy",
      icon: <DeleteIcon />,
    },
    {
      key: "zip",
      label: "Zip",
      icon: <PatternflyArchiveIcon />,
    },
  ];

  const [operation, setOperation] = useState<DropdownOperation | null>(null);

  const onZip = () => {
    // XXX TO DISCUSS: whether we create a node below the node, or we create an independent data-feed?
    // fetchPipeline(node.item);
    close();
  };

  const onClick: MenuProps["onClick"] = (e) => {
    e.domEvent.stopPropagation();
    switch (e.key) {
      case "zip":
        onZip();
        break;
      default:
        setOperation((e.key as DropdownOperation) || null);
    }
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

  const closeModal = () => {
    setOperation(null);
  };

  const onMouseLeave = () => {
    closeModal();
    close();
  };

  const menu: MenuProps = { items, onClick };
  const rootClassName = isVisible ? styles.root : styles.hide;
  const rootStyle: CSSProperties = {
    top: position.y,
    left: position.x,
  };
  return (
    <>
      {/** biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave dropdown */}
      <div
        className={rootClassName}
        style={rootStyle}
        onMouseLeave={onMouseLeave}
      >
        <Dropdown menu={menu} open={isVisible}>
          {children}
        </Dropdown>
      </div>
      <AddNode isOpen={operation === "addNode"} close={closeModal} />
      <DeleteNode isOpen={operation === "deleteNode"} close={closeModal} />
      <AddPipeline isOpen={operation === "addPipeline"} close={closeModal} />
    </>
  );
};
