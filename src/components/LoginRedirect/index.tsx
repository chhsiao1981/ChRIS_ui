import {
  getDefaultID,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect } from "react";
import * as DoUser from "../../reducers/user";
import styles from "./LoginRedirect.module.css";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, doUser] = useUser;
  const userID = getDefaultID(classStateUser);

  useEffect(() => {
    if (!userID) {
      return;
    }

    if (window.location.pathname !== "/oidc-redirect") {
      return;
    }

    doUser.oidcRedirect(userID, window.location.search);
  }, [doUser, userID]);

  return <div className={styles.empty} />;
};
