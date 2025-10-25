import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type React from "react";
import type { ReactNode } from "react";
import * as DoPkg from "../../reducers/pkg";
import * as DoPkgInstance from "../../reducers/pkgInstance";
import { PkgNodeOperation } from "../../reducers/types";
import { Dropdown, type MenuProps } from "../Antd";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";

type TDoPkg = ThunkModuleToFunc<typeof DoPkg>;
type TDoPkgInstance = ThunkModuleToFunc<typeof DoPkgInstance>;

type Props = {
  onZip: () => void;
  children?: ReactNode;
  usePkg: UseThunk<DoPkg.State, TDoPkg>;
  usePkgInstance: UseThunk<DoPkgInstance.State, TDoPkgInstance>;
};
export default (props: Props) => {
  const { onZip, children, usePkg, usePkgInstance } = props;
  const [classStatePkg, doPkg] = usePkg;
  const pkgID = getRootID(classStatePkg);
  const pkg = getState(classStatePkg) || DoPkg.defaultState;
  const { nodeOperations } = pkg;

  const [classStatePkgInstance, _] = usePkgInstance;
  const pkgInstanceState =
    getState(classStatePkgInstance) || DoPkgInstance.defaultState;
  const { selectedPkgInstance, errmsg } = pkgInstanceState;

  const cancelled = !!errmsg;
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Add a Child Node",
      icon: <AddIcon />,
      disabled: cancelled || !nodeOperations[PkgNodeOperation.ChildNode],
    },
    {
      key: "2",
      label: "Add a Pipeline",
      icon: <AddIcon />,
      disabled: cancelled || !nodeOperations[PkgNodeOperation.ChildPipeline],
    },
    {
      key: "3",
      label: "Add a Graph Node",
      disabled: !nodeOperations[PkgNodeOperation.GraphNode],
      icon: <AddIcon />,
    },
    {
      key: "4",
      label: "Delete a Node",
      disabled:
        (selectedPkgInstance?.plugin_type === "fs" &&
          selectedPkgInstance?.plugin_name === "pl-dircopy") ||
        !nodeOperations[PkgNodeOperation.DeleteNode],
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
      doPkg.toggleNodeOperation(pkgID, PkgNodeOperation.ChildNode);
    }
    if (e.key === "2") {
      doPkg.toggleNodeOperation(pkgID, PkgNodeOperation.ChildPipeline);
    }

    if (e.key === "3") {
      doPkg.toggleNodeOperation(pkgID, PkgNodeOperation.GraphNode);
    }

    if (e.key === "4") {
      doPkg.toggleNodeOperation(pkgID, PkgNodeOperation.DeleteNode);
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
