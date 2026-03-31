import type { MouseEventHandler } from "react";
import { DeleteIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
};

export default (props: Props) => {
  const { onClick, count } = props;

  const ariaLabel =
    count === 1 ? "Delete selected item" : "Delete selected items";

  return (
    <OperationButton
      onClick={onClick}
      count={count}
      icon={<DeleteIcon />}
      ariaLabel={ariaLabel}
    />
  );
};
