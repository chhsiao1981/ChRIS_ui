import { Alert } from "@patternfly/react-core";
import Wrapper from "../Wrapper";

export default () => {
  return (
    <Wrapper>
      <Alert
        title="Page Not Found"
        variant="danger"
        aria-label="Page not found"
      >
        Go{" "}
        <a href="/" target="_PARENT">
          Home
        </a>{" "}
      </Alert>
    </Wrapper>
  );
};
