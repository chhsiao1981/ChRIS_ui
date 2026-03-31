import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";
import Title from "./Title";

export default () => {
  return (
    <Wrapper title={<Title />}>
      <PacsApp />
    </Wrapper>
  );
};
