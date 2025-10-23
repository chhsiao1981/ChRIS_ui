import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
} from "@patternfly/react-core";
import * as DoCart from "../../../reducers/cart";
import { CartLayout } from "../../../reducers/types";
import { BarsIcon, GripVerticalIcon } from "../../Icons";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { currentLayout } = cart;

  const onChange: ToggleGroupItemProps["onChange"] = (event) => {
    doCart.switchLayout(cartID, event.currentTarget.id);
  };

  return (
    <ToggleGroup>
      <ToggleGroupItem
        aria-label="switch to a list layout"
        icon={<BarsIcon />}
        buttonId="list"
        onChange={onChange}
        isSelected={currentLayout === CartLayout.List}
      />
      <ToggleGroupItem
        aria-label="switch to a grid layout"
        buttonId="grid"
        icon={<GripVerticalIcon />}
        onChange={onChange}
        isSelected={currentLayout === CartLayout.Grid}
      />
    </ToggleGroup>
  );
};
