import type { MouseEventHandler } from "react";
import { DownloadIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
};

export default (props: Props) => {
  const { onClick, count } = props;

  const ariaLabel =
    count === 1 ? "Download selected item" : "Download selected items";

  return (
    <OperationButton
      onClick={onClick}
      count={count}
      icon={<DownloadIcon />}
      ariaLabel={ariaLabel}
    />
  );
};
