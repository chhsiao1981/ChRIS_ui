import { useMutation } from "@tanstack/react-query";
import { getFileHref, getFileName } from "../api/common";
import { createDownloadToken } from "../api/serverApi";
import type { Feed, FileBrowserFolderFile } from "../api/types";

export const useDownload = (feed?: Feed) => {
  const handleDownload = async (file: FileBrowserFolderFile) => {
    if (feed?.public) {
      await downloadPublicFile(file);
    } else {
      await downloadFile(file);
    }
    return file;
  };

  const handleDownloadMutation = useMutation({
    mutationFn: (file: FileBrowserFolderFile) => handleDownload(file),
  });

  return handleDownloadMutation;
};

const downloadFile = async (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.fname);

  // The base URL for downloading
  const baseUrl = getFileHref(file);
  if (!baseUrl) {
    throw new Error("Failed to construct the URL");
  }

  if (file.public === true) {
    // If the file is public, no token needed
    return downloadPublicFile(file);
  }

  const {
    status: _status,
    data: downloadToken,
    errmsg,
  } = await createDownloadToken();
  if (errmsg) {
    throw new Error(`downloadFile: unable to createDownloadToken: ${errmsg}`);
  }
  if (!downloadToken) {
    throw new Error(`downloadFile: unable to createDownloadToken: no token`);
  }
  const { token } = downloadToken;
  const authorizedUrl = `${baseUrl}?download_token=${token}`;

  // Finally, trigger the download
  createLinkAndDownload(authorizedUrl, fileName);
  return file;
};

const downloadPublicFile = (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.fname);
  const url = getFileHref(file);
  if (!url) {
    throw new Error("Failed to construct the URL");
  }
  createLinkAndDownload(url, fileName);
  return file;
};

const createLinkAndDownload = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
