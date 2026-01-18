import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Navigate } from "react-router-dom";
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

  return isValid ? (
    children
  ) : (
    <Navigate to={`/login?redirectTo=${redirectTo}`} />
  );
};
