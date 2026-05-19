import { Skeleton } from "@patternfly/react-core";
import { Th, Tr } from "@patternfly/react-table";
import styles from "./SkeletonRows.module.css";

type Props = {
  isHide?: boolean;
};
export default (props: Props) => {
  const { isHide } = props;
  const className = isHide ? styles.hide : undefined;
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <Tr className={className} key={`skeleton-row-${index}`}>
          <Th>
            <Skeleton width="20px" />
          </Th>
          <Th>
            <Skeleton width="100px" />
          </Th>
          <Th>
            <Skeleton width="80px" />
          </Th>
          <Th>
            <Skeleton width="80px" />
          </Th>
          <Th>
            <Skeleton width="60px" />
          </Th>
        </Tr>
      ))}
    </>
  );
};
