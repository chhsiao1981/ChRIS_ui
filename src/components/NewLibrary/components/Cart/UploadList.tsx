import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { List } from "antd";
import type * as DoCart from "../../../../reducers/cart";
import type { FileUpload, FolderUpload } from "../../../../reducers/types";
import UploadStatus from "./UploadStatus";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  uploadStatus: FileUpload | FolderUpload;
  type: "file" | "folder";
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { uploadStatus, type, useCart } = props;
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
        />
      )}
    />
  );
};
