import { Button, Tooltip } from "@patternfly/react-core";
import type { CSSProperties, MouseEventHandler } from "react";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
  icon: React.ReactElement;
  ariaLabel: string;
  label?: string;
  isHide?: boolean;
};

export default (props: Props) => {
  const {
    ariaLabel,
    count,
    label: propsLabel,
    icon,
    isHide: propsIsHide,
    onClick,
  } = props;
  const label = propsLabel || "";
  const isHide = propsIsHide || false;

  const tooltipStyle: CSSProperties = {};
  const buttonStyle: CSSProperties = {
    marginRight: "1em",
  };
  if (isHide || count === 0) {
    buttonStyle.display = "none";
  }

  return (
    <Tooltip content={ariaLabel} style={tooltipStyle}>
      <Button
        style={buttonStyle}
        icon={icon}
        size="sm"
        onClick={onClick}
        variant="tertiary"
        aria-label={ariaLabel}
      >
        {label}
      </Button>
    </Tooltip>
  );
};
