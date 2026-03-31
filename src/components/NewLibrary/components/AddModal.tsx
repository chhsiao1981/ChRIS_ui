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
import type { DefaultError } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import "./Operations.css";
import type * as DoOperation from "../../../reducers/operation";
import type { OperationsAdditionalValues } from "./types";

type ModalTypeLabel = {
  modalTitle: string;
  inputLabel: string;
  buttonLabel: string;
};

const MODAL_TYPE_LABELS: Record<DoOperation.ModalStateType, ModalTypeLabel> = {
  "": {
    modalTitle: "",
    inputLabel: "",
    buttonLabel: "",
  },
  group: {
    modalTitle: "Create a new Group",
    inputLabel: "Group Name",
    buttonLabel: "Create",
  },
  share: {
    modalTitle: "Share this Folder",
    inputLabel: "User Name (optional if making public)",
    buttonLabel: "Share",
  },
  rename: {
    modalTitle: "Rename",
    inputLabel: "Rename",
    buttonLabel: "Rename",
  },
  createFeed: {
    modalTitle: "Create Feed",
    inputLabel: "Feed Name",
    buttonLabel: "Create",
  },
  createFeedWithFile: {
    modalTitle: "Create Feed",
    inputLabel: "Feed Name",
    buttonLabel: "Create",
  },
  default: {
    modalTitle: "Create a new Folder",
    inputLabel: "Folder Name",
    buttonLabel: "Create",
  },
};

type Props = {
  modalState: DoOperation.ModalState;
  onClose: () => void;
  onSubmit: (
    inputValue: string,
    additionalValues?: OperationsAdditionalValues,
  ) => void;
  indicators: {
    isPending: boolean;
    isError: boolean;
    error: DefaultError | null;
    clearErrors: () => void;
  };
};

export default (props: Props) => {
  const { modalState, onClose, onSubmit, indicators } = props;
  const [inputValue, setInputValue] = useState("");
  const [additionalValues, setAdditionalValues] =
    useState<OperationsAdditionalValues>({
      share: { public: false },
    });

  const { modalTitle, inputLabel, buttonLabel } = useMemo(() => {
    const modalType =
      MODAL_TYPE_LABELS[modalState.type] ?? MODAL_TYPE_LABELS.default;
    return {
      modalTitle: modalType.modalTitle,
      inputLabel: modalType.inputLabel,
      buttonLabel: modalType.buttonLabel,
    };
  }, [modalState.type]);

  const userIsTypingUsername =
    modalState.type === "share" && inputValue.length > 0;
  const userSelectedPublic =
    modalState.type === "share" && additionalValues.share.public;
  const showMutualExclusiveAlert = userIsTypingUsername || userSelectedPublic;

  useEffect(() => {
    if (modalState.additionalProps?.createFeedWithFile) {
      setInputValue(
        modalState.additionalProps.createFeedWithFile.defaultFeedName,
      );
    }
    if (modalState.additionalProps?.createFeed) {
      setInputValue(modalState.additionalProps.createFeed.defaultFeedName);
    }

    if (
      modalState.type === "rename" &&
      modalState.additionalProps?.defaultName
    ) {
      setInputValue(modalState.additionalProps.defaultName);
    }
  }, [modalState.additionalProps, modalState.type]);

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const isShareModal = modalState.type === "share";

  const isDisabled = isShareModal
    ? !additionalValues.share.public && !inputValue
    : !inputValue;

  return (
    <Modal
      isOpen={modalState.isOpen}
      variant="small"
      aria-label={modalTitle}
      title={modalTitle}
      onClose={handleClose}
    >
      <Form>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <TextInput
              name="input"
              value={inputValue}
              onChange={(_e, value) => setInputValue(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(inputValue, additionalValues);
                }
              }}
              aria-label={inputLabel}
              placeholder={inputLabel}
              isDisabled={isShareModal && additionalValues.share.public}
            />
            {/* Reserved space for helper text to prevent layout shifts */}
            <div style={{ minHeight: "20px", marginTop: "2px" }}>
              {modalState.type === "createFeedWithFile" ||
              modalState.type === "createFeed" ? (
                <HelperText>
                  <HelperTextItem>
                    Please provide a name for your feed or hit 'Create' to use
                    the default name
                  </HelperTextItem>
                </HelperText>
              ) : isShareModal ? (
                <HelperText>
                  <HelperTextItem variant="warning">
                    You can either share with a specific user OR make the
                    resource public, not both.
                  </HelperTextItem>
                </HelperText>
              ) : (
                /* Empty space to maintain consistent layout */
                <div />
              )}
            </div>
          </div>

          {isShareModal && (
            <div style={{ marginTop: "0.5rem" }}>
              <Checkbox
                id="make-public"
                label="Make this resource public"
                isChecked={additionalValues.share.public}
                isDisabled={userIsTypingUsername}
                onChange={(_event, checked) => {
                  setAdditionalValues({
                    ...additionalValues,
                    share: { public: checked },
                  });
                }}
              />
            </div>
          )}

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
                opacity: indicators.isError ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                Failed operation:
              </span>{" "}
              {indicators.error?.message || ""}
              {indicators.isError && (
                <Button
                  variant="plain"
                  style={{ marginLeft: "auto", padding: "0" }}
                  onClick={() => indicators.clearErrors()}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <ActionGroup>
            <Button
              onClick={() => onSubmit(inputValue, additionalValues)}
              isLoading={indicators.isPending}
              isDisabled={isDisabled}
            >
              {buttonLabel}
            </Button>
            <Button variant="link" onClick={handleClose}>
              Cancel
            </Button>
          </ActionGroup>
        </div>
      </Form>
    </Modal>
  );
};
