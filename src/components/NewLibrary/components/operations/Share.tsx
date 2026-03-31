import type { MouseEventHandler } from "react";
import type { HTMLButtonElement } from "../../../../../node_modules.docker/happy-dom/cjs";

import { ShareIcon } from "../../../Icons";
import OperationButton from "./OperationButton";

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  count: number;
};

export default (props: Props) => {
  const { onClick, count } = props;

  const ariaLabel =
    count === 1 ? "Share selected item" : "Share selected items";

  return (
    <>
      <OperationButton
        onClick={onClick}
        count={count}
        icon={<ShareIcon />}
        ariaLabel={ariaLabel}
      />
    </>
  );
};
