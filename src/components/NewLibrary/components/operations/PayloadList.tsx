import {
  getRootID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Chip, ChipGroup } from "@patternfly/react-core";
import { getFileName } from "../../../../api/common";
import type * as DoCart from "../../../../reducers/cart";
import type { SelectionPayload } from "../../../../store/cart/types";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  selectedPaths: SelectionPayload[];
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { selectedPaths, useCart } = props;

  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);

  return (
    <ChipGroup>
      {selectedPaths.map((selection) => (
        <Chip
          key={selection.path}
          onClick={() => doCart.removeSelectedPayload(cartID, selection)}
        >
          {getFileName(selection.path)}
        </Chip>
      ))}
    </ChipGroup>
  );
};
