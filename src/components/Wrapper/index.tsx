import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./wrapper.css";

import {
  genUUID,
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Page } from "@patternfly/react-core";
import * as DoCart from "../../reducers/cart";
import * as DoFeedList from "../../reducers/feedList";
import * as DoOperation from "../../reducers/operation";
import * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";

import { OperationsProvider } from "../NewLibrary/context";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type Props = {
  children: ReactElement[] | ReactElement;
  title?: ReactElement;
};

export default (props: Props) => {
  const { children, title } = props;
  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [classUI, doUI] = useUI;
  const ui = getState(classUI) || DoUI.defaultState;
  const uiID = getDefaultID(classUI);
  const { isNavOpen, sidebarActiveItem } = ui;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classUser, _] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const useOperation = useThunk<DoOperation.State, TDoOperation>(DoOperation);
  const [_classOperation, doOperation] = useOperation;

  const useFeedList = useThunk<DoFeedList.State, TDoFeedList>(DoFeedList);

  const [operationID, _setOeprationID] = useState(genUUID());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: init
  useEffect(() => {
    doOperation.init(operationID, fileInputRef, folderInputRef);
  }, []);

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
      sidebar={
        <OperationsProvider>
          <Sidebar
            useUI={useUI}
            useUser={useUser}
            useCart={useCart}
            operationID={operationID}
            useOperation={useOperation}
            useFeedList={useFeedList}
            isLoggedIn={isLoggedIn}
          />
        </OperationsProvider>
      }
    >
      {children}
    </Page>
  );
};
