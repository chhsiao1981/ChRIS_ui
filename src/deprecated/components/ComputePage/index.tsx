import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import Wrapper from "../Wrapper";
import ComputeCatalog from "./ComputeCatalog";
import Title from "./Title";

export default () => {
  useEffect(() => {
    document.title = "Compute Catalog";
  }, []);

  return (
    <Wrapper title={Title}>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </Wrapper>
  );
};
