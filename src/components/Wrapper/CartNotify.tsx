import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Button } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import * as DoCart from "../../reducers/cart";
import { Badge } from "../Antd";
import { BrainIcon } from "../Icons";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const CartNotify = () => {
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;

  const {
    fileDownloadStatus,
    fileUploadStatus,
    folderDownloadStatus,
    folderUploadStatus,
  } = cart;

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const showNotification = !isEmpty({
      ...fileDownloadStatus,
      ...fileUploadStatus,
      ...folderDownloadStatus,
      ...folderUploadStatus,
    });
    setShowNotification(showNotification);
  }, [
    fileDownloadStatus,
    folderDownloadStatus,
    fileUploadStatus,
    folderUploadStatus,
  ]);

  return (
    <Badge dot={showNotification}>
      <Button
        variant="tertiary"
        icon={<BrainIcon />}
        onClick={() => doCart.setToggleCart(cartID)}
      />
    </Badge>
  );
};

export default CartNotify;
