import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
} from "@patternfly/react-core";
import * as DoCart from "../../../reducers/cart";
import { BarsIcon, GripVerticalIcon } from "../../Icons";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const LayoutSwitch = () => {
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;

  const { currentLayout } = cart;

  const handleChange: ToggleGroupItemProps["onChange"] = (event) => {
    doCart.switchLibraryLayout(cartID, event.currentTarget.id);
  };
  return (
    <ToggleGroup>
      <ToggleGroupItem
        aria-label="switch to a list layout"
        icon={<BarsIcon />}
        buttonId="list"
        onChange={handleChange}
        isSelected={currentLayout === "list"}
      />
      <ToggleGroupItem
        aria-label="switch to a grid layout"
        buttonId="grid"
        icon={<GripVerticalIcon />}
        onChange={handleChange}
        isSelected={currentLayout === "grid"}
      />
    </ToggleGroup>
  );
};

export default LayoutSwitch;
