import {
  getRootID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button, Tooltip } from "@patternfly/react-core";
import { FolderIcon } from "@patternfly/react-icons";
import { useNavigate } from "react-router";
import type * as DoCart from "../../../reducers/cart";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  path: string;
  isError: boolean;

  useCart: UseThunk<DoCart.State, TDoCart>;
};
export default (props: Props) => {
  const { path, isError, useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);

  const navigate = useNavigate();
  return (
    <Tooltip content={"Show in Folder"}>
      <Button
        isDisabled={isError}
        onClick={() => {
          navigate(`/library/${path}`);
          // Close the cart once the user wants to navigate away
          doCart.toggle(cartID);
        }}
        variant="link"
        icon={<FolderIcon />}
      />
    </Tooltip>
  );
};
