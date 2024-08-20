import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
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
import { notification } from "../../Antd";
import { isEmpty } from "lodash";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getFileExtension } from "../../../api/model";
import useDownload, { useTypedSelector } from "../../../store/hooks";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import useLongPress, {
  elipses,
  getBackgroundRowColor,
} from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";
import { useQueryClient } from "@tanstack/react-query";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type ComponentProps = {
  name: string;
  computedPath: string;
  date: string;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseDown?: () => void;
  inValidateFolders?: () => void;
  onCheckboxChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onContextMenuClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onNavigate: () => void;
  isChecked?: boolean;
  icon: React.ReactElement;
  bgRow?: string;
};

const PresentationComponent: React.FC<ComponentProps> = ({
  name,
  inValidateFolders,
  date,
  onClick,
  onNavigate,
  onMouseDown,
  onCheckboxChange,
  onContextMenuClick,
  isChecked,
  icon,
  bgRow,
}) => (
  <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
    <FolderContextMenu inValidateFolders={() => inValidateFolders?.()}>
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
              <div>{!isEmpty(date) ? new Date(date).toDateString() : ""}</div>
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
};

export const LinkCard: React.FC<LinkCardProps> = ({
  linkFiles,
  computedPath,
}) => {
  return (
    <>
      {linkFiles.map((val) => (
        <SubLinkCard
          key={val.data.fname}
          linkFile={val}
          computedPath={computedPath}
        />
      ))}
    </>
  );
};

type FilesCardProps = {
  files: FileBrowserFolderFile[];
  computedPath: string;
  pagination?: Pagination;
};

export const FilesCard: React.FC<FilesCardProps> = ({
  files,
  computedPath,
}) => (
  <>
    {files.map((file) => (
      <SubFileCard
        key={file.data.fname}
        file={file}
        computedPath={computedPath}
      />
    ))}
  </>
);

type SubFileCardProps = {
  file: FileBrowserFolderFile;
  computedPath: string;
};

export const SubFileCard: React.FC<SubFileCardProps> = ({
  file,
  computedPath,
}) => {
  const queryClient = useQueryClient();
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);

  const fileName = file.data.fname.split("/").pop() || "";
  const isSelected = selectedPaths.some(
    (payload) => payload.path === file.data.fname,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);
  const ext = getFileExtension(file.data.fname);
  const icon = getIcon(ext, isDarkTheme);

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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    handlers.handleOnClick(e, file, file.data.fname, "file");

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, file.data.fname, file, "file");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        onClick={handleClick}
        inValidateFolders={() => {
          queryClient.refetchQueries({
            queryKey: ["library_folders", computedPath],
          });
        }}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => setIsPreview(!preview)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={fileName}
        date={file.data.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
      />
      <Modal
        className="library-preview"
        variant={ModalVariant.large}
        title="Preview"
        aria-label="viewer"
        isOpen={preview}
        onClose={() => setIsPreview(false)}
      >
        <FileDetailView selectedFile={file} preview="large" />
      </Modal>
    </>
  );
};

type SubLinkCardProps = {
  linkFile: FileBrowserFolderLinkFile;
  computedPath: string;
};

export const SubLinkCard: React.FC<SubLinkCardProps> = ({
  linkFile,
  computedPath,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();

  const linkName = linkFile.data.path.split("/").pop() || "";
  const isSelected = selectedPaths.some(
    (payload) => payload.path === linkFile.data.path,
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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    handlers.handleOnClick(e, linkFile, linkFile.data.path, "linkFile");

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, linkFile.data.path, linkFile, "linkFile");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        onClick={handleClick}
        inValidateFolders={() => {
          queryClient.refetchQueries({
            queryKey: ["library_folders", computedPath],
          });
        }}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => navigate(linkFile.data.path)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={linkName}
        date={linkFile.data.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
      />
    </>
  );
};
