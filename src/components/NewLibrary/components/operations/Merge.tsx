import type { MouseEventHandler } from "react";
import { MergeIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
};

export default (props: Props) => {
  const { onClick, count } = props;

  const ariaLabel =
    count === 1 ? "Merge selected item" : "Merge selected items";

  return (
    <OperationButton
      onClick={onClick}
      count={count}
      icon={<MergeIcon />}
      ariaLabel={ariaLabel}
    />
  );
};
