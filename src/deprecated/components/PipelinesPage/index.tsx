import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineProvider } from "../PipelinesCopy/context";
import Wrapper from "../Wrapper";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isStaff } = user;

  useEffect(() => {
    document.title = "Packages Catalog";
  }, []);

  return (
    <Wrapper title={<InfoSection title="Packages" />}>
      <PageSection>
        <PipelineProvider>
          <Pipelines isStaff={isStaff} />
        </PipelineProvider>
      </PageSection>
    </Wrapper>
  );
};
