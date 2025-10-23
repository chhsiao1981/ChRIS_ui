import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  GridItem,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Tooltip,
} from "@patternfly/react-core";
import { differenceInSeconds } from "date-fns";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { getFileExtension } from "../../../api/model";
import type { FileBrowserFolderFile } from "../../../api/types";
import * as DoCart from "../../../reducers/cart";
import { PathType } from "../../../reducers/types";
import * as DoUser from "../../../reducers/user";
import useDownload, { useAppSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext } from "../context";
import getBackgroundRowColor from "../utils/getBackgroundRowColor";
import getFileName from "../utils/getFileName";
import useLongPress from "../utils/useLongPress";
import Presentation from "./Presentation";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  theFile: FileBrowserFolderFile;
  computedPath: string;

  useCart: UseThunk<DoCart.State, TDoCart>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const {
    theFile,
    computedPath,

    useCart,
    useUser,
  } = props;

  const [classStateCart, _] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const [classStateUser, _2] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;

  const { isDarkTheme } = useContext(ThemeContext);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress(useCart);
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
  const [isNewFile, setIsNewFile] = useState<boolean>(false);
  const creationDate = new Date(theFile.creation_date);
  const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);
  const [isNewFolder, setIsNewFolder] = useState<boolean>(
    secondsSinceCreation <= 15,
  );
  const fileName = getFileName(theFile);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === theFile.fname,
  );
  const shouldHighlight = isNewFolder || isSelected;
  const selectedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
  const ext = getFileExtension(theFile.fname);
  const icon = getIcon(ext, isDarkTheme);

  useEffect(() => {
    if (isNewFolder) {
      const timeoutId = setTimeout(() => {
        setIsNewFolder(false);
      }, 2000); // 60 seconds

      // Cleanup the timeout if the component unmounts before the timeout completes
      return () => clearTimeout(timeoutId);
    }
  }, [isNewFolder]);

  useEffect(() => {
    const creationDate = new Date(theFile.creation_date);
    const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);

    if (secondsSinceCreation <= 15) {
      setIsNewFile(true);
      const timeoutId = setTimeout(() => {
        setIsNewFile(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [theFile.creation_date]);

  useEffect(() => {
    if (handleDownloadMutation.isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });
      setTimeout(() => handleDownloadMutation.reset(), 1000);
    }

    if (handleDownloadMutation.isError) {
      api.error({
        message: "Download Error",
        description: handleDownloadMutation.error?.message,
      });
    }
  }, [
    handleDownloadMutation.isSuccess,
    handleDownloadMutation.isError,
    api,
    handleDownloadMutation,
  ]);

  const onClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    handlers.onClick(e, theFile, theFile.fname, PathType.File, () => {
      setIsPreview(!preview);
    });
  };

  const onChangeCheckbox = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.onChangeCheckbox(e, theFile.fname, theFile, PathType.File);
  };

  return (
    <>
      {contextHolder}
      <Presentation
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={onClick}
        onMouseDown={handlers.onMouseDown}
        onCheckboxChange={onChangeCheckbox}
        onContextMenuClick={onClick}
        onNavigate={() => setIsPreview(!preview)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={fileName}
        date={theFile.creation_date}
        icon={icon}
        bgRow={
          isNewFile ? getBackgroundRowColor(true, isDarkTheme) : selectedBgRow
        }
        username={username}
      />
      <Modal
        className="library-preview"
        variant={ModalVariant.large}
        title="Preview"
        aria-label="viewer"
        isOpen={preview}
        onClose={() => setIsPreview(false)}
      >
        <FileDetailView
          selectedFile={theFile}
          preview="large"
          useUser={useUser}
        />
      </Modal>
    </>
  );
};
