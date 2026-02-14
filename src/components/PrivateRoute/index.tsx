import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { redirect } from "../../api/redirect";
import * as DoUser from "../../reducers/user";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  children: JSX.Element;
};

export default (props: Props) => {
  const { children } = props;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn, isInit } = user;

  const redirectTo = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );

  const isValid = isLoggedIn || !isInit;
  if (!isValid) {
    // use redirect to have a clean react state.
    redirect(`/login?redirectTo=${redirectTo}`);
  }

  return children;
};
