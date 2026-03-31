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
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import * as DoCart from "../../../../reducers/cart";
import * as DoOperation from "../../../../reducers/operation";
import { getMergeNameFromSelections } from "./utils";

type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const title = "Merge Data";
const label = "Merged name";
const buttonLabel = "Merge";

type Props = {
  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useCart: UseThunk<DoCart.State, TDoCart>;

  isLoading?: boolean;
  error?: string;
};
export default (props: Props) => {
  const { error, isLoading, operationID, useOperation, useCart } = props;

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const { modalState } = operation;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);
  const cart = getState(classCart, cartID) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen =
    modalState.type === "merge" &&
    modalState.ID === operationID &&
    modalState.isOpen;

  useEffect(() => {
    if (modalState.type !== "merge" || !selectedPaths.length) {
      return;
    }

    const defaultName = getMergeNameFromSelections(selectedPaths);

    setValue(defaultName);
  }, [modalState.type, selectedPaths]);

  const isError = !!error;

  const onClose = () => {
    doOperation.closeModal(operationID);
  };

  const onChange = (_e: any, value: string) => setValue(value);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const onClick = (_e: MouseEvent) => onSubmit(value);

  const onSubmit = (value: string) => {
    console.info("MergeModal.onSubmit: to doCart.rename: value:", value);
    doCart.merge(cartID, value);
    setValue("");
    doOperation.closeModal(operationID);
  };

  const clearErrors = () => {
    doOperation.clearError(operationID);
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
              ref={inputRef}
              value={value}
              onChange={onChange}
              onKeyDown={onKeydown}
              aria-label={label}
              placeholder={label}
            />
            {/* Reserved space for helper text to prevent layout shifts */}
            <div style={{ minHeight: "20px", marginTop: "2px" }}>
              <HelperText>
                <HelperTextItem>
                  You can merge multiple data together.
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
                  onClick={clearErrors}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <ActionGroup>
            <Button onClick={onClick} isLoading={isLoading} isDisabled={!value}>
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
