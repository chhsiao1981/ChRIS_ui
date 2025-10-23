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
import { differenceInSeconds, format } from "date-fns";
import { isEmpty } from "lodash";
import type React from "react";
import {
  type FormEvent,
  type MouseEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { getFileExtension } from "../../../api/model";
import useDownload, { useAppSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext, type OriginState } from "../context";
import elipses from "../utils/elipses";
import getBackgroundRowColor from "../utils/getBackgroundRowColor";
import { getFileName } from "../utils/getFileName";
import useLongPress from "../utils/useLongPress";
import FolderContextMenu from "./FolderContextMenu";
import { SubFileCard } from "./SubFileCard";
import type { Pagination } from "./types";

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
  // For dicom scrolling
  list?: FileBrowserFolderFile[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
};

export const FilesCard: React.FC<FilesCardProps> = ({
  files,
  computedPath,
  list,
  fetchMore,
  handlePagination,
  filesLoading,
}) => (
  <>
    {files.map((file) => (
      <SubFileCard
        key={file.data.fname}
        file={file}
        computedPath={computedPath}
        list={list}
        fetchMore={fetchMore}
        filesLoading={filesLoading}
        handlePagination={handlePagination}
      />
    ))}
  </>
);

type SubLinkCardProps = {
  linkFile: FileBrowserFolderLinkFile;
  computedPath: string;
};

export const getLinkFileName = (file: FileBrowserFolderLinkFile) => {
  return file.data.path.split("/").pop() || "";
};

export const SubLinkCard: React.FC<SubLinkCardProps> = ({
  linkFile,
  computedPath,
}) => {
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();

  const linkName = getLinkFileName(linkFile);
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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    handlers.onClick(e, linkFile, linkFile.data.path, "linkFile", () => {
      navigate(linkFile.data.path);
    });
  };

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.onChangeCheckbox(e, linkFile.data.path, linkFile, "linkFile");
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
        onMouseDown={handlers.onMouseDown}
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
