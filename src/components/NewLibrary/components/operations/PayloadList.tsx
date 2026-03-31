import {
  getDefaultID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Chip, ChipGroup } from "@patternfly/react-core";
import { getFileName } from "../../../../api/common";
import type * as DoCart from "../../../../reducers/cart";
import type { CartSelection } from "../../../../reducers/types";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  selectedPaths: CartSelection[];
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { selectedPaths, useCart } = props;

  const [classStateCart, doCart] = useCart;
  const cartID = getDefaultID(classStateCart);

  return (
    <ChipGroup>
      {selectedPaths.map((selectedPath) => (
        <Chip
          key={selectedPath.path}
          onClick={() => doCart.removeSelected(cartID, selectedPath)}
        >
          {getFileName(selectedPath.path)}
        </Chip>
      ))}
    </ChipGroup>
  );
};
