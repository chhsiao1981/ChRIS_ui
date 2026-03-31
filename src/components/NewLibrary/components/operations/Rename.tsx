import type { MouseEventHandler } from "react";
import { EditIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
};

export default (props: Props) => {
  const { onClick, count } = props;
  const isHide = count > 1;

  return (
    <OperationButton
      onClick={onClick}
      count={count}
      icon={<EditIcon />}
      ariaLabel="Rename"
      isHide={isHide}
    />
  );
};
