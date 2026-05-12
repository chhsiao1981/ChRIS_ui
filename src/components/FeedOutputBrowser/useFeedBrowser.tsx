import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ID } from "../../api/types";
import * as DoDrawer from "../../reducers/drawer";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import fetchFolders from "../NewLibrary/utils/fetchFolders";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

const TERMINAL_STATUSES = [
  "finishedSuccessfully",
  "finishedWithError",
  "cancelled",
];

const getInitialDownloadState = () => ({
  count: 0,
  status: false,
  plugin_name: "",
  error: "",
  fetchingFiles: false,
});

export const useFeedBrowser = (
  statuses: Record<ID, string>,
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>,
) => {
  const [classDrawer, _] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const { files, preview } = drawer;

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );

  const [classPluginInstance, _doPluginInstance] = usePluginInstance;

  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance: selected } = pluginInstance;

  const [download, setDownload] = useState(getInitialDownloadState);
  const [currentPath, setCurrentPath] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const isFinished =
    TERMINAL_STATUSES.includes(statuses[selected?.id || ""]) ||
    TERMINAL_STATUSES.includes(selected?.status || "");

  const queryKey = ["pluginFiles", currentPath, pageNumber];
  const {
    data: pluginFilesPayload,
    isFetching: filesLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchFolders(currentPath, pageNumber),
    enabled: Boolean(selected && currentPath && isFinished),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  const handlePagination = useCallback(() => {
    setPageNumber((prev) => prev + 1);
  }, []);

  const fetchMore =
    pluginFilesPayload?.foldersPagination?.hasNextPage ||
    pluginFilesPayload?.filesPagination?.hasNextPage ||
    pluginFilesPayload?.linksPagination?.hasNextPage;

  const observerTarget = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Get the scrollable container if available
    const scrollableContainer = document.querySelector(".file-list") || null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && fetchMore && !filesLoading) {
          handlePagination();
        }
      },
      {
        root: scrollableContainer, // Use the scrollable container as the viewport
        threshold: 0, // Trigger as soon as any part of the element is visible
        rootMargin: "100px 0px", // Add margin to trigger earlier
      },
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchMore, handlePagination, filesLoading]);

  useEffect(() => {
    if (isFinished && download.error) {
      setDownload((prev) => ({
        ...prev,
        error: "Files are not ready for download now...",
      }));
      setTimeout(() => {
        setDownload(getInitialDownloadState);
      }, 3000);
    }
  }, [isFinished, download.error]);

  useEffect(() => {
    setCurrentPath(selected?.output_path || "");
  }, [selected]);

  const handleFileClick = (path: string) => {
    if (selected) {
      setCurrentPath(path);
    }
  };

  return {
    handleFileClick,
    filesLoading,
    isError,
    error,
    download,
    selected,
    pluginFilesPayload,
    filesStatus: files,
    previewStatus: preview,
    currentPath,
    observerTarget,
    fetchMore,
    finished: isFinished,
    handlePagination,
  };
};
