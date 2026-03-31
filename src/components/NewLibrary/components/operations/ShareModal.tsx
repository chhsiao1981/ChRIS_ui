import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  HelperText,
  HelperTextItem,
  Modal,
  TextInput,
} from "@patternfly/react-core";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type * as DoCart from "../../../../reducers/cart";
import * as DoOperation from "../../../../reducers/operation";

type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const title = "Share Data";
const label = "User Name (optional if making public)";
const buttonLabel = "Share";

type Props = {
  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useCart: UseThunk<DoCart.State, TDoCart>;

  isLoading?: boolean;
  error?: string;
};
export default (props: Props) => {
  const { isLoading, error, operationID, useOperation, useCart } = props;
  const isError = !!error;

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const { modalState } = operation;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);

  const isOpen =
    modalState.type === "share" &&
    modalState.ID === operationID &&
    modalState.isOpen;

  const [targetUsername, setTargetUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const isTyping = targetUsername.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    if (!isOpen) {
      return;
    }
    // XXX hack to have inputRef focus.
    setTimeout(() => inputRef.current?.focus(), 5);
  }, [isOpen, inputRef.current]);

  const onChange = (_e: any, value: string) => setTargetUsername(value);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(targetUsername);
    }
  };

  const onCheckIsPublic = (_e: any, isChecked: boolean) => {
    console.info("ShareModal.onCheckIsPublic: isChecked:", isChecked);
    setIsPublic(isChecked);
  };

  const onClose = () => {
    setTargetUsername("");
    doOperation.closeModal(operationID);
  };

  const onClick = (_e: MouseEvent) => onSubmit(targetUsername);

  const onSubmit = (targetUsername: string) => {
    console.info(
      "ShareModal.onSubmit: to doCart.share: targetUsername:",
      targetUsername,
    );
    doCart.share(cartID, targetUsername, isPublic);
    setTargetUsername("");
    doOperation.closeModal(operationID);
  };

  const clearErrors = () => {
    doOperation.clearError(operationID);
  };

  console.info(
    "ShareModal: to render: isOpen:",
    isOpen,
    "targetUsername:",
    targetUsername,
    "isPublic:",
    isPublic,
    "title:",
    title,
  );
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
              ref={inputRef}
              value={targetUsername}
              onChange={onChange}
              onKeyDown={onKeydown}
              aria-label={label}
              placeholder={label}
            />
            {/* Reserved space for helper text to prevent layout shifts */}
            <div style={{ minHeight: "20px", marginTop: "2px" }}>
              <HelperText>
                <HelperTextItem>
                  You can share with a specific user or make the resource
                  public.
                </HelperTextItem>
              </HelperText>
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <Checkbox
              id="make-public"
              label="Make this data public"
              isChecked={isPublic}
              isDisabled={isTyping}
              onChange={onCheckIsPublic}
            />
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
                  onClick={clearErrors}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <ActionGroup>
            <Button
              onClick={onClick}
              isLoading={isLoading}
              isDisabled={!targetUsername && !isPublic}
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
