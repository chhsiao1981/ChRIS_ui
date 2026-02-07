import type { KeyboardEvent, ReactElement } from "react";
import AnonSidebar from "./AnonSidebar";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./wrapper.css";

import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Page } from "@patternfly/react-core";
import * as DoCart from "../../reducers/cart";
import * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import { OperationsProvider } from "../NewLibrary/context";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  children: ReactElement[] | ReactElement;
  title?: ReactElement;
};

export default (props: Props) => {
  const { children, title } = props;
  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [classStateUI, doUI] = useUI;
  const ui = getState(classStateUI) || DoUI.defaultState;
  const uiID = getRootID(classStateUI);
  const { isNavOpen, sidebarActiveItem } = ui;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const niivueActive = sidebarActiveItem === "niivue";

  const onNavToggle = () => {
    doUI.setIsNavOpen(uiID, !isNavOpen);
  };

  const onPageResize = (
    _event: MouseEvent | TouchEvent | KeyboardEvent<Element>,
    data: { mobileView: boolean; windowSize: number },
  ) => {
    if (data.mobileView) {
      doUI.setIsNavOpen(uiID, false);
    }

    // The default setting of the niivue viewer is without a sidebar active. It explicitly set's it to false in it's component.
    if (!data.mobileView && !niivueActive) {
      doUI.setIsNavOpen(uiID, true);
    }
  };

  const sidebar = isLoggedIn ? (
    <OperationsProvider>
      <Sidebar useUI={useUI} useUser={useUser} useCart={useCart} />
    </OperationsProvider>
  ) : (
    <AnonSidebar isNavOpen={isNavOpen} sidebarActiveItem={sidebarActiveItem} />
  );

  return (
    <Page
      onPageResize={onPageResize}
      header={
        <Header
          onNavToggle={onNavToggle}
          titleComponent={title}
          isNavOpen={isNavOpen}
        />
      }
      sidebar={sidebar}
    >
      {children}
    </Page>
  );
};
