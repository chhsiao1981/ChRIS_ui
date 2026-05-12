import { Button, DrawerActions, DrawerHead } from "@patternfly/react-core";
import type { MouseEventHandler } from "react";
import { CompressArrowsAltIcon, ExpandArrowsAltIcon } from "../Icons";
import styles from "./DrawerActionButton.module.css";

type Props = {
  onMaximize: MouseEventHandler;
  onMinimize: MouseEventHandler;
  isMaximized: boolean;
};
export default (props: Props) => {
  const { onMaximize, onMinimize, isMaximized } = props;

  const className = isMaximized ? styles["btn-max"] : styles["btn-min"];
  const Icon = isMaximized ? CompressArrowsAltIcon : ExpandArrowsAltIcon;
  const onClick = isMaximized ? onMinimize : onMaximize;

  return (
    <DrawerHead>
      <DrawerActions>
        <Button
          className={className}
          variant="link"
          icon={<Icon />}
          onClick={onClick}
        />
      </DrawerActions>
    </DrawerHead>
  );
};
