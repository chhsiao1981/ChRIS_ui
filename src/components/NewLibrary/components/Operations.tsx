import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { type CSSProperties, Fragment } from "react";
import { useLocation } from "react-router";
import { Alert as AntdAlert, notification } from "../../Antd";
import LayoutSwitch from "./LayoutSwitch";
import "./Operations.css";
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import * as DoCart from "../../../reducers/cart";
import type * as DoFeedList from "../../../reducers/feedList";
import * as DoOperation from "../../../reducers/operation";
import * as DoUser from "../../../reducers/user";
import { AddNodeProvider } from "../../AddNode/context";
import { CreateFeedProvider } from "../../CreateFeed/context";
import { PipelineProvider } from "../../PipelinesCopy/context";
import CreateAnalysis from "./operations/CreateAnalysis";
import Delete from "./operations/Delete";
import DeleteModal from "./operations/DeleteModal";
import Download from "./operations/Download";
import Merge from "./operations/Merge";
import MergeModal from "./operations/MergeModal";
import PayloadList from "./operations/PayloadList";
import Rename from "./operations/Rename";
import RenameModal from "./operations/RenameModal";
import Share from "./operations/Share";
import ShareModal from "./operations/ShareModal";
import UploadData from "./operations/UploadData";
import UploadDataModal from "./operations/UploadDataModal";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type ClassNames = {
  toolbar?: string; // to be used in Toolbar
  toolbarItem?: string;
};

type Styles = {
  toolbar?: CSSProperties; // to be used in Toolbar
  toolbarItem?: CSSProperties;
};

type Props = {
  styles?: Styles;
  classNames?: ClassNames;

  useCart: UseThunk<DoCart.State, TDoCart>;

  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useUser: UseThunk<DoUser.State, TDoUser>;

  feedListID?: string;
  useFeedList?: UseThunk<DoFeedList.State, TDoFeedList>;
};

// Operations
//
// Components in FeedListView, FileBrowser, and FeedView.
export default (props: Props) => {
  const {
    styles,
    classNames,

    useCart,

    operationID,
    useOperation,

    useUser,

    feedListID,
    useFeedList,
  } = props;

  const location = useLocation();

  const [_notifyAPI, notifyComponent] = notification.useNotification();

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const { userRelatedError } = operation;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);
  const cart = getState(classCart) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const selectedCount = selectedPaths.length;

  const [classUser, doUser] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { username, isStaff } = user;

  const toolbarItems = (
    <Fragment>
      {notifyComponent}
      <ToolbarItem>
        <UploadData operationID={operationID} useOperation={useOperation} />
        {userRelatedError && (
          <AntdAlert
            style={{ marginLeft: "1rem" }}
            type="error"
            description={userRelatedError}
            closable
            onClose={() => doOperation.clearError(operationID)}
          />
        )}
      </ToolbarItem>

      <ToolbarItem>
        <CreateFeedProvider>
          <PipelineProvider>
            <AddNodeProvider>
              <CreateAnalysis
                count={selectedCount}
                isStaff={isStaff}
                useCart={useCart}
              />
            </AddNodeProvider>
          </PipelineProvider>
        </CreateFeedProvider>

        <Download
          onClick={() => doCart.startDownload(cartID, username)}
          count={selectedCount}
        />

        <Merge
          onClick={() => doOperation.merge(operationID)}
          count={selectedCount}
        />

        <Share
          onClick={() => doOperation.share(operationID)}
          count={selectedCount}
        />

        <Delete
          onClick={() => doOperation.remove(operationID)}
          count={selectedCount}
        />
      </ToolbarItem>

      <ToolbarItem>
        <Rename
          onClick={() => doOperation.rename(operationID)}
          count={selectedCount}
        />
      </ToolbarItem>

      <ToolbarItem>
        <PayloadList selectedPaths={selectedPaths} useCart={useCart} />
      </ToolbarItem>
    </Fragment>
  );

  const clearErrors = () => {};

  return (
    <>
      <Toolbar style={styles?.toolbar} className={classNames?.toolbar}>
        <ToolbarContent
          style={styles?.toolbarItem}
          className={classNames?.toolbarItem}
        >
          {toolbarItems}
          {location.pathname.startsWith("/library/") && (
            <ToolbarItem align={{ default: "alignRight" }}>
              <LayoutSwitch />
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>

      {/* modal */}
      <UploadDataModal
        operationID={operationID}
        useOperation={useOperation}
        useCart={useCart}
        useUser={useUser}
        feedListID={feedListID}
        useFeedList={useFeedList}
        clearErrors={clearErrors}
      />

      <ShareModal
        operationID={operationID}
        useOperation={useOperation}
        useCart={useCart}
      />

      <DeleteModal
        operationID={operationID}
        useOperation={useOperation}
        useCart={useCart}
      />

      <RenameModal
        operationID={operationID}
        useOperation={useOperation}
        useCart={useCart}
      />

      <MergeModal
        operationID={operationID}
        useOperation={useOperation}
        useCart={useCart}
      />
    </>
  );
};
