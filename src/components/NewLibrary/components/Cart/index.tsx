import { Button } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { Link, useNavigate } from "react-router-dom";
import { getFileName } from "../../../../api/common";
import { Drawer, List, Popconfirm, Space } from "../../../Antd";
import { EmptyStateComponent } from "../../../Common";
import { FileIcon, FolderIcon } from "../../../Icons";
import TitleNameClipped from "./TitleNameClipped";
import "./Cart.css";
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import * as DoCart from "../../../../reducers/cart";
import styles from "./Cart.module.css";
import DownloadStaus from "./DownloadStatus";
import UploadList from "./UploadList";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

/* Cart
 *
 * Displaying the status of:
 *   1. file/folder upload.
 *   2. selected data-feeds/folders.
 *   3. data-feed/folder download status (zip).
 */
export default () => {
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const [classCart, doCart] = useCart;
  const cartID = getDefaultID(classCart);
  const cart = getState(classCart) || DoCart.defaultState;
  const {
    openCart,
    fileUploadStatus,
    folderUploadStatus,
    fileDownloadStatus,
    folderDownloadStatus,
  } = cart;

  const navigate = useNavigate();

  const fileDownloadClassName = isEmpty(fileDownloadStatus)
    ? styles.hide
    : "operation-cart";

  const folderDownloadClassName = isEmpty(folderDownloadStatus)
    ? styles.hide
    : "operation-cart";

  return (
    <Drawer
      width={"700px"}
      title={<>Notification Panel</>}
      open={openCart}
      onClose={() => {
        doCart.toggle(cartID);
      }}
      extra={
        <Space>
          <Button
            style={{ color: "inherit" }}
            variant="danger"
            onClick={() => {
              doCart.clearCart(cartID);
            }}
          >
            Clear Notifications
          </Button>
        </Space>
      }
    >
      {/** Code for File and Folder Downloads */}
      <List
        className={fileDownloadClassName}
        dataSource={Object.entries(fileDownloadStatus)}
        renderItem={([id, status]) => (
          <List.Item
            key={id}
            actions={[
              <DownloadStaus key={`status-${id}`} currentStatus={status} />,
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
                  name={status.filename ? getFileName(status.filename) : "N/A"}
                  value={40}
                />
              }
            />
          </List.Item>
        )}
      />

      {/** Code for Folder Downloads */}
      <List
        className={folderDownloadClassName}
        dataSource={Object.entries(folderDownloadStatus)}
        renderItem={([id, status]) => {
          const isInProgress = status.step === "processing";
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
                <DownloadStaus key={`status-${id}`} currentStatus={status} />,
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

      {/** Code for File and Folder Uploads */}

      <UploadList
        uploadStatus={fileUploadStatus}
        type="file"
        useCart={useCart}
        navigate={navigate}
      />
      <UploadList
        uploadStatus={folderUploadStatus}
        type="folder"
        useCart={useCart}
        navigate={navigate}
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
