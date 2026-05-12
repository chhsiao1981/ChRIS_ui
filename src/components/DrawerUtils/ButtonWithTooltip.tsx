import { Button, Tooltip } from "@patternfly/react-core";
import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  content?: ReactNode;
  position?: any;
  description?: string;
  className?: string;
  onClick: MouseEventHandler;
  isDisabled: boolean;
  Icon?: ReactNode;
};

export default (props: Props) => {
  const {
    content,
    position,
    description,
    className,
    onClick,
    isDisabled,
    Icon,
  } = props;

  const variant = isDisabled ? "primary" : "control";

  return (
    <Tooltip position={position} content={content}>
      <Button
        className={className}
        onClick={onClick}
        variant={variant}
        icon={Icon}
      >
        {description}
      </Button>
    </Tooltip>
  );
};
