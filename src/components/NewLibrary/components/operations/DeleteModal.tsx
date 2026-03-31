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
  Label,
  Modal,
} from "@patternfly/react-core";
import type { MouseEventHandler } from "react";
import type * as DoCart from "../../../../reducers/cart";
import * as DoOperation from "../../../../reducers/operation";

type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useCart: UseThunk<DoCart.State, TDoCart>;
};

const title = "⚠️ Delete Data";
const label = "Are you sure to delete the data?";
const buttonLabel = "Delete";

export default (props: Props) => {
  const { operationID, useOperation, useCart } = props;

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const { modalState } = operation;

  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);

  const isOpen =
    modalState.type === "delete" &&
    modalState.ID === operationID &&
    modalState.isOpen;

  const onClose = () => {
    doOperation.closeModal(operationID);
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = (_e) => {
    doCart.deleteSelectedPaths(cartID);
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
        <Label>{label}</Label>
        <ActionGroup>
          <Button onClick={onClick}>{buttonLabel}</Button>
          <Button variant="link" onClick={onClose}>
            Cancel
          </Button>
        </ActionGroup>
      </Form>
    </Modal>
  );
};
