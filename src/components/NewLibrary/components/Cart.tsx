import { Button, Text, Tooltip } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import { getFileName } from "../../../api/common";
import {
  DownloadTypes,
  type FileUpload,
  type FileUploadObject,
  type FolderUpload,
  type FolderUploadObject,
} from "../../../store/cart/types";
import { Drawer, List, Popconfirm, Space } from "../../Antd";
import { DotsIndicator, EmptyStateComponent } from "../../Common";
import { CheckCircleIcon, CloseIcon, FileIcon, FolderIcon } from "../../Icons";
import {
  elipses,
  formatBytesWithPadding,
  ShowInFolder,
  TitleNameClipped,
} from "../utils/longpress";
import "./Cart.css";
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";
import * as DoCart from "../../../reducers/cart";

//import Status from "../../NodeDetails/Status";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const Cart = () => {
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);
  const cart = getState(classStateCart) || DoCart.defaultState;
  const {
    openCart,
    fileUploadStatus,
    folderUploadStatus,
    fileDownloadStatus,
    folderDownloadStatus,
  } = cart;

  return (
    <Drawer
      width={"700px"}
      title={<>Notification Panel</>}
      open={openCart}
      onClose={() => {
        doCart.setToggleCart(cartID);
      }}
      extra={
        <Space>
          <Button
            style={{ color: "inherit" }}
            variant="danger"
            onClick={() => {
              // Implement clear cart logic here
              // This version of cart only clears out finished operations
              doCart.clearCart(cartID);
            }}
          >
            Clear Notifications
          </Button>
        </Space>
      }
    >
      {/** Code for File and Folder Downloads */}
      {!isEmpty(fileDownloadStatus) && (
        <List
          className="operation-cart"
          dataSource={Object.entries(fileDownloadStatus)}
          renderItem={([id, status]) => (
            <List.Item
              key={id}
              actions={[
                <Status key={`status-${id}`} currentStatus={status} />,
                <Button
                  onClick={() => doCart.clearDownloadStatus(cartID, id, "file")}
                  variant="secondary"
                  size="sm"
                  key={`a-${id}`}
                >
                  Clear
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileIcon />}
                title={
                  <TitleNameClipped
                    name={
                      status.filename ? getFileName(status.filename) : "N/A"
                    }
                    value={40}
                  />
                }
              />
            </List.Item>
          )}
        />
      )}

      {/** Code for Folder Downloads */}
      {!isEmpty(folderDownloadStatus) && (
        <List
          className="operation-cart"
          dataSource={Object.entries(folderDownloadStatus)}
          renderItem={([id, status]) => {
            const isInProgress = status.step === DownloadTypes.progress;
            const buttonText = isInProgress ? "Cancel" : "Clear";

            const handleAction = () => {
              doCart.clearDownloadStatus(cartID, id, "folder");
            };

            const ActionButton = (
              <Button
                variant="secondary"
                size="sm"
                key={`a-${id}`}
                onClick={isInProgress ? undefined : handleAction}
              >
                {buttonText}
              </Button>
            );

            const description = (
              <span>
                You will lose progress if you cancel.
                {status.feed && (
                  <>
                    {" "}
                    You can download it from here:{" "}
                    <Link
                      to={`feeds/${status.feed.id}?type=${status.feed.public ? "public" : "private"}`} // Adjust this route as needed
                      onClick={(e) => e.stopPropagation()} // Prevent Popconfirm from closing when clicking the link
                    >
                      {status.feed.name}
                    </Link>
                  </>
                )}
              </span>
            );

            return (
              <List.Item
                key={id}
                actions={[
                  <Status key={`status-${id}`} currentStatus={status} />,
                  isInProgress ? (
                    <Popconfirm
                      placement="top"
                      key={`a-${id}`}
                      title="Are you sure you want to cancel?"
                      description={description}
                      onConfirm={handleAction}
                      okText="Yes"
                      cancelText="No"
                    >
                      {ActionButton}
                    </Popconfirm>
                  ) : (
                    ActionButton
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<FolderIcon />}
                  title={
                    <TitleNameClipped
                      name={
                        status.filename ? getFileName(status.filename) : "N/A"
                      }
                      value={30}
                    />
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {/** Code for File and Folder Uploads */}

      <UploadList
        uploadStatus={fileUploadStatus}
        type="file"
        useCart={useCart}
      />
      <UploadList
        uploadStatus={folderUploadStatus}
        type="folder"
        useCart={useCart}
      />

      {isEmpty(folderUploadStatus) &&
        isEmpty(fileUploadStatus) &&
        isEmpty(fileDownloadStatus) &&
        isEmpty(folderDownloadStatus) && (
          <EmptyStateComponent title="No data..." />
        )}
    </Drawer>
  );
};

export default Cart;

/************************************************ */
/*  Utility Components for the cart                */
/*********************************************** */
export const Status = ({
  currentStatus,
}: {
  currentStatus: { step: DownloadTypes; error?: string };
}) => {
  const { step, error } = currentStatus;
  switch (step) {
    case DownloadTypes.started:
      return <DotsIndicator title="" />;
    case DownloadTypes.finished:
      return (
        <Button
          variant="plain"
          icon={<CheckCircleIcon color="#3E8635" width="2em" height="2em" />}
        />
      );
    case DownloadTypes.cancelled:
      return (
        <Tooltip content={error}>
          <Text>{error ? elipses(error, 45) : "Uncaught error"}</Text>
        </Tooltip>
      );
    default:
      return currentStatus ? <DotsIndicator title={step} /> : null;
  }
};

type UploadStatusProp = FileUpload | FolderUpload;
interface UploadListProps {
  uploadStatus: UploadStatusProp;
  type: "file" | "folder";
  useCart: UseThunk<DoCart.State, TDoCart>;
}
const UploadList: React.FC<UploadListProps> = ({
  uploadStatus,
  type,
  useCart,
}) => (
  <List
    className="operation-cart"
    dataSource={Object.entries(uploadStatus)}
    renderItem={([name, status]) => (
      <UploadStatus status={status} type={type} name={name} useCart={useCart} />
    )}
  />
);

interface UploadStatusProps {
  status: FileUploadObject | FolderUploadObject;
  type: "file" | "folder";
  name: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
}

const UploadStatus: React.FC<UploadStatusProps> = (props) => {
  const { status, type, name, useCart } = props;
  const [classStateCart, doCart] = useCart;
  const cartID = getRootID(classStateCart);

  const isError =
    status.currentStep.includes("Cancelled") ||
    status.currentStep.startsWith("Error");

  // Determine if the upload is complete
  const isComplete = status.currentStep === "Upload Complete";

  // Determine when to show the status text
  const showStatusText =
    status.currentStep === "Server Processing..." || isError || isComplete;

  const handleAction = () => {
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

  if (showStatusText) {
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
  } else if (type === "file" && !showStatusText) {
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
      onClick={handleAction}
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
