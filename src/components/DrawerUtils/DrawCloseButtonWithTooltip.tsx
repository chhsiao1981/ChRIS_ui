import { DrawerCloseButton, Tooltip } from "@patternfly/react-core";
import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  onClick: MouseEventHandler;
  content?: ReactNode;
};

export default (props: Props) => {
  const { onClick, content } = props;
  return (
    <Tooltip position="bottom" content={content}>
      <DrawerCloseButton onClick={onClick} />
    </Tooltip>
  );
};
