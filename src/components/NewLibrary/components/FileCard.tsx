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
import { differenceInSeconds, format } from "date-fns";
import { isEmpty } from "lodash";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getFileExtension } from "../../../api/model";
import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../../api/types";
import * as DoCart from "../../..//reducers/cart";
import type * as DoUser from "../../../reducers/user";
import { notification } from "../../Antd";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext, type OriginState } from "../context";
import useLongPress, {
  elipses,
  getBackgroundRowColor,
} from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type ComponentProps = {
  name: string;
  computedPath: string;
  date: string;
  origin: OriginState;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseDown?: () => void;
  onCheckboxChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onContextMenuClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onNavigate: () => void;
  isChecked?: boolean;
  icon: React.ReactElement;
  bgRow?: string;

  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

const PresentationComponent: React.FC<ComponentProps> = ({
  name,
  origin,
  computedPath,
  date,
  onClick,
  onNavigate,
  onMouseDown,
  onCheckboxChange,
  onContextMenuClick,
  isChecked,
  icon,
  bgRow,
  username,
}) => (
  <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
    <FolderContextMenu
      username={username}
      origin={origin}
      computedPath={computedPath}
    >
      <Card
        style={{ cursor: "pointer", background: bgRow || "inherit" }}
        isCompact
        isSelectable
        isClickable
        isFlat
        isRounded
        onClick={onClick}
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenuClick}
      >
        <CardHeader
          actions={{
            actions: (
              <Checkbox
                className="large-checkbox"
                isChecked={isChecked}
                id={name}
                onClick={(e) => e.stopPropagation()}
                onChange={onCheckboxChange}
              />
            ),
          }}
        >
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>{icon}</SplitItem>
            <SplitItem>
              <Tooltip content={name}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate();
                  }}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  {elipses(name, 40)}
                </Button>
              </Tooltip>

              <div
                style={{
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  {!isEmpty(date)
                    ? format(new Date(date), "dd MMM yyyy, HH:mm")
                    : "N/A"}
                </div>
              </div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </FolderContextMenu>
  </GridItem>
);

type LinkCardProps = {
  linkFiles: FileBrowserFolderLinkFile[];
  computedPath: string;
  pagination?: Pagination;
  username: string;
};

export const LinkCard: React.FC<LinkCardProps> = ({
  linkFiles,
  computedPath,
  username,
}) => {
  return (
    <>
      {linkFiles.map((val) => (
        <SubLinkCard
          key={val.fname}
          linkFile={val}
          computedPath={computedPath}
          username={username}
        />
      ))}
    </>
  );
};

type FilesCardProps = {
  files: FileBrowserFolderFile[];
  computedPath: string;
  pagination?: Pagination;
  // For dicom scrolling
  list?: FileBrowserFolderFile[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;

  username: string;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export const FilesCard = (props: FilesCardProps) => {
  const {
    files,
    computedPath,
    list,
    fetchMore,
    handlePagination,
    filesLoading,
    username,
    useUser,
    useCart,
  } = props;
  return (
    <>
      {files.map((file) => (
        <SubFileCard
          key={file.fname}
          file={file}
          computedPath={computedPath}
          list={list}
          fetchMore={fetchMore}
          filesLoading={filesLoading}
          handlePagination={handlePagination}
          username={username}
          useUser={useUser}
          useCart={useCart}
        />
      ))}
    </>
  );
};

type SubFileCardProps = {
  file: FileBrowserFolderFile;
  computedPath: string;
  // For dicom scrolling
  list?: FileBrowserFolderFile[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;

  username: string;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export const getFileName = (
  file: FileBrowserFolderFile | FileBrowserFolderLinkFile,
) => {
  return file.fname.split("/").pop() || "";
};

export const SubFileCard = (props: SubFileCardProps) => {
  const {
    file,
    computedPath,
    list,
    fetchMore,
    handlePagination,
    filesLoading,
    username,
    useUser,
    useCart,
  } = props;
  const { isDarkTheme } = useContext(ThemeContext);
  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
  const [isNewFile, setIsNewFile] = useState<boolean>(false);
  const creationDate = file.creation_date;
  const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);
  const [isNewFolder, setIsNewFolder] = useState<boolean>(
    secondsSinceCreation <= 15,
  );
  const fileName = getFileName(file);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === file.fname,
  );
  const shouldHighlight = isNewFolder || isSelected;
  const selectedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
  const ext = getFileExtension(file.fname);
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
    const creationDate = new Date(file.creation_date);
    const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);

    if (secondsSinceCreation <= 15) {
      setIsNewFile(true);
      const timeoutId = setTimeout(() => {
        setIsNewFile(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [file.creation_date]);

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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    handlers.handleOnClick(e, file, file.fname, "file", () => {
      setIsPreview(!preview);
    });
  };

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, file.fname, file, "file");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={handleClick}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => setIsPreview(!preview)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={fileName}
        date={file.creation_date}
        icon={icon}
        bgRow={
          isNewFile ? getBackgroundRowColor(true, isDarkTheme) : selectedBgRow
        }
        username={username}
        useCart={useCart}
      />
      <Modal
        className="library-preview"
        variant={ModalVariant.large}
        title="Preview"
        aria-label="viewer"
        isOpen={preview}
        onClose={() => setIsPreview(false)}
      >
        <FileDetailView selectedFile={file} preview="large" useUser={useUser} />
      </Modal>
    </>
  );
};

type SubLinkCardProps = {
  linkFile: FileBrowserFolderLinkFile;
  computedPath: string;
  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export const getLinkFileName = (file: FileBrowserFolderLinkFile) => {
  return file.path.split("/").pop() || "";
};

export const SubLinkCard: React.FC<SubLinkCardProps> = (
  props: SubLinkCardProps,
) => {
  const { linkFile, computedPath, username, useCart } = props;
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);

  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();

  const linkName = getLinkFileName(linkFile);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === linkFile.path,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  const icon = <ExternalLinkSquareAltIcon />;

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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    handlers.handleOnClick(e, linkFile, linkFile.path, "linkFile", () => {
      navigate(linkFile.path);
    });
  };

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, linkFile.path, linkFile, "linkFile");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={handleClick}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => navigate(linkFile.path)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={linkName}
        date={linkFile.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
        username={username}
        useCart={useCart}
      />
    </>
  );
};
