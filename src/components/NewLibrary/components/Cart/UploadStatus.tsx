import {
  getDefaultID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  CloseIcon,
  FileIcon,
  FolderIcon,
} from "@patternfly/react-icons";
import type { FileBrowserType } from "../../../../api/types/fileBrowser";
import type * as DoCart from "../../../../reducers/cart";
import type {
  FileUploadObject,
  FolderUploadObject,
} from "../../../../reducers/types";
import { List } from "../../../Antd";
import {
  formatBytesWithPadding,
  ShowInFolder,
  TitleNameClipped,
} from "../../utils/longpress";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

export type Props = {
  status: FileUploadObject | FolderUploadObject;
  type: FileBrowserType;
  name: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { status, type, name, useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cartID = getDefaultID(classStateCart);

  const isError =
    status.currentStep.includes("Cancelled") ||
    status.currentStep.startsWith("Error");

  // Determine if the upload is complete
  const isComplete = status.currentStep === "Upload Complete";

  // Determine when to show the status text
  const isShowStatusText =
    status.currentStep === "Server Processing..." || isError || isComplete;

  const onClickCancelClear = () => {
    if (status.currentStep === "Uploading...") {
      doCart.cancelUpload(cartID, type, name);
    } else {
      doCart.clearUploadState(cartID, name, type);
    }
  };

  const loadedBytes = formatBytesWithPadding(
    (status as FileUploadObject).loaded || 0,
  );
  const totalBytes = formatBytesWithPadding(
    (status as FileUploadObject).total || 0,
  );

  // Build the actions array based on the current status
  const actions = [];

  if (isShowStatusText) {
    // Conditionally add the status text (e.g., "Server Processing...", errors, completion)
    actions.push(
      <div key={`status-${name}`}>
        <TitleNameClipped value={35} name={status.currentStep} />
      </div>,
    );
  }

  if (isComplete) {
    // Add the appropriate icon or progress
    actions.push(
      <CheckCircleIcon
        key={`anon-${name}-progress`}
        color="#3E8635"
        width="2em"
        height="2em"
      />,
    );
  } else if (isError) {
    actions.push(
      <CloseIcon
        color="red"
        width="2em"
        height="2em"
        key={`anon-${name}-cancel`}
      />,
    );
  } else if (type === "file" && !isShowStatusText) {
    // Show progress during upload
    actions.push(
      <div
        key={`anon-${name}-bytes`}
        style={{
          fontFamily: "monospace",
        }}
      >
        {loadedBytes}/{totalBytes}
      </div>,
    );
  } else if (type === "folder") {
    actions.push(
      <div key={`anon-${name}-progress`}>
        {(status as FolderUploadObject).done}/
        {(status as FolderUploadObject).total}
      </div>,
    );
  }

  // Add the "Show in Folder" component
  actions.push(
    <ShowInFolder
      isError={isError}
      key={`anon-${name}-show`}
      path={status.path}
    />,
  );

  // Add the action button ("Cancel" or "Clear")
  actions.push(
    <Button
      onClick={onClickCancelClear}
      variant="secondary"
      size="sm"
      key={`a-${name}`}
    >
      {status.currentStep === "Uploading..." ? "Cancel" : "Clear"}
    </Button>,
  );

  return (
    <List.Item key={name} actions={actions}>
      <List.Item.Meta
        avatar={type === "file" ? <FileIcon /> : <FolderIcon />}
        title={<TitleNameClipped name={name} value={30} />}
      />
    </List.Item>
  );
};
