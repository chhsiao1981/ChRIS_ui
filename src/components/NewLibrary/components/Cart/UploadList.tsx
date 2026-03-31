import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { List } from "antd";
import type { NavigateFunction } from "react-router";
import type * as DoCart from "../../../../reducers/cart";
import type {
  FileUploadMap,
  FolderUploadMap,
} from "../../../../reducers/types";
import UploadStatus from "./UploadStatus";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  uploadStatus: FileUploadMap | FolderUploadMap;
  type: "file" | "folder";
  useCart: UseThunk<DoCart.State, TDoCart>;
  navigate: NavigateFunction;
};

export default (props: Props) => {
  const { uploadStatus, type, useCart, navigate } = props;
  return (
    <List
      className="operation-cart"
      dataSource={Object.entries(uploadStatus)}
      renderItem={([name, status]) => (
        <UploadStatus
          status={status}
          type={type}
          name={name}
          useCart={useCart}
          navigate={navigate}
        />
      )}
    />
  );
};
