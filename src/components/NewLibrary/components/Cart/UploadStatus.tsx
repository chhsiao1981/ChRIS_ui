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
import type { NavigateFunction } from "react-router";
import type { FileBrowserType } from "../../../../api/types/fileBrowser";
import type * as DoCart from "../../../../reducers/cart";
import type { FileUpload, FolderUpload } from "../../../../reducers/types";
import { List } from "../../../Antd";
import formatBytesWithPadding from "../../utils/formatBytesWithPadding";
import ShowInFolder from "./ShowInFolder";
import TitleNameClipped from "./TitleNameClipped";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

export type Props = {
  status: FileUpload | FolderUpload;
  type: FileBrowserType;
  name: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
  navigate: NavigateFunction;
};

export default (props: Props) => {
  const { status, type, name, useCart, navigate } = props;
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
    console.info(
      "UploadStatus: onClickCancelClear: cartID:",
      cartID,
      "type:",
      type,
      "name:",
      name,
      "currentStep:",
      status.currentStep,
    );
    if (status.currentStep === "Uploading...") {
      doCart.cancelUpload(cartID, type, name);
    } else {
      doCart.clearUploadState(cartID, name, type);
    }
  };

  const loadedBytes = formatBytesWithPadding(
    (status as FileUpload).loaded || 0,
  );
  const totalBytes = formatBytesWithPadding((status as FileUpload).total || 0);

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
        {(status as FolderUpload).done}/{(status as FolderUpload).total}
      </div>,
    );
  }

  const onClickShowInFolder = () => {
    navigate(`/library/${status.path}`);
    doCart.close(cartID);
  };

  // Add the "Show in Folder" component
  actions.push(
    <ShowInFolder
      isError={isError}
      key={`anon-${name}-show`}
      prompt="Show in Data Feed"
      onClick={onClickShowInFolder}
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
