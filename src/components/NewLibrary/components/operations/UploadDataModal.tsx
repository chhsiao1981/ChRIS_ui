import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  ActionGroup,
  Button,
  Form,
  HelperText,
  HelperTextItem,
  Modal,
  TextInput,
} from "@patternfly/react-core";
import { useEffect, useState } from "react";
import type * as DoCart from "../../../../reducers/cart";
import type * as DoFeedList from "../../../../reducers/feedList";
import * as DoOperation from "../../../../reducers/operation";
import * as DoUser from "../../../../reducers/user";

type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

const title = "Upload Data";
const label = "Name";
const buttonLabel = "Create";

type Props = {
  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useCart: UseThunk<DoCart.State, TDoCart>;

  useUser: UseThunk<DoUser.State, TDoUser>;

  feedListID: string;
  useFeedList: UseThunk<DoFeedList.State, TDoFeedList>;

  isLoading?: boolean;
  error?: string;
  clearErrors: () => void;
};
export default (props: Props) => {
  const {
    isLoading,
    error,
    clearErrors,

    operationID,
    useOperation,
    useCart,
    useUser,
    feedListID,
    useFeedList,
  } = props;
  const isError = !!error;

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const {
    modalStateType,
    modalStateIsOpen,
    modalStateID,
    uploadData: { theType, defaultFeedName },
    files,
  } = operation;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);

  const [classUser, _doUser] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { username } = user;

  const [_classFeedList, doFeedList] = useFeedList;

  const isOpen =
    modalStateType === "createFeedWithFile" &&
    modalStateID === operationID &&
    modalStateIsOpen;
  const isFolder = theType === "folder";

  const [value, setValue] = useState(defaultFeedName);
  useEffect(() => {
    setValue(defaultFeedName);
  }, [defaultFeedName]);

  const onClose = () => {
    setValue("");
    doOperation.closeModal(operationID);
  };

  const onSubmit = (value: string) => {
    doOperation.upload(
      operationID,
      files,
      username,
      isFolder,
      value,
      cartID,
      doCart,
      feedListID,
      doFeedList,
    );
    doOperation.closeModal(operationID);
  };

  return (
    <Modal
      isOpen={isOpen}
      variant="small"
      aria-label={title}
      title={title}
      onClose={onClose}
    >
      <Form>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <TextInput
              name="input"
              value={value}
              onChange={(_e, value) => setValue(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(value);
                }
              }}
              aria-label={label}
              placeholder={label}
            />
            {/* Reserved space for helper text to prevent layout shifts */}
            <div style={{ minHeight: "20px", marginTop: "2px" }}>
              <HelperText>
                <HelperTextItem>
                  Please provide a name for your data and then hit 'Create' to
                  create the data.
                </HelperTextItem>
              </HelperText>
            </div>
          </div>

          {/* Reserved space for error alerts to prevent layout shifts */}
          <div style={{ minHeight: "20px", marginTop: "2px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(220, 53, 69, 0.5)",
                borderRadius: "3px",
                padding: "0 16px",
                backgroundColor: "rgba(220, 53, 69, 0.08)",
                color: "#dc3545",
                opacity: isError ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                Failed operation:
              </span>{" "}
              {error || ""}
              {isError && (
                <Button
                  variant="plain"
                  style={{ marginLeft: "auto", padding: "0" }}
                  onClick={() => clearErrors()}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <ActionGroup>
            <Button
              onClick={() => onSubmit(value)}
              isLoading={isLoading}
              isDisabled={!value}
            >
              {buttonLabel}
            </Button>
            <Button variant="link" onClick={onClose}>
              Cancel
            </Button>
          </ActionGroup>
        </div>
      </Form>
    </Modal>
  );
};
