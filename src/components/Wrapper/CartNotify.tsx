import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import * as DoCart from "../../reducers/cart";
import { Badge } from "../Antd";
import { BrainIcon } from "../Icons";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const cartID = getRootID(classStateCart);

  const {
    fileDownloadStatus,
    fileUploadStatus,
    folderDownloadStatus,
    folderUploadStatus,
  } = cart;

  const [isShowNotification, setShowNotification] = useState(false);

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
    <Badge dot={isShowNotification}>
      <Button
        variant="tertiary"
        icon={<BrainIcon />}
        onClick={() => doCart.toggle(cartID)}
      />
    </Badge>
  );
};
