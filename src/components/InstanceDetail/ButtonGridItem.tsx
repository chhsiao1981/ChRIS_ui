import { GridItem } from "@patternfly/react-core";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default (props: Props) => {
  const { children } = props;
  return (
    <GridItem sm={12} lg={6} xl={5} xl2={5}>
      {children}
    </GridItem>
  );
};
