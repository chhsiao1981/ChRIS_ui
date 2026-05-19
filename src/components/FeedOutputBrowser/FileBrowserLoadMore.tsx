import { Button } from "@patternfly/react-core";
import type { MouseEventHandler, RefObject } from "react";
import type { HTMLButtonElement } from "../../../node_modules.docker/happy-dom/cjs";
import styles from "./FileBrowserLoadMore.module.css";

type Props = {
  isLoadMore: boolean;
  ref: RefObject<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};
export default (props: Props) => {
  const { isLoadMore, ref, onClick } = props;
  const classNameIsLoadMore = isLoadMore ? styles["load-more"] : styles.hide;

  return (
    <div className={classNameIsLoadMore} ref={ref}>
      <Button onClick={onClick} variant="link">
        Load more data...
      </Button>
    </div>
  );
};
