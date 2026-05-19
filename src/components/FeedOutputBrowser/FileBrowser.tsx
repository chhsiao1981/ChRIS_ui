import {
  genUUID,
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Spinner } from "@patternfly/react-core";
import { useEffect, useRef, useState } from "react";
import * as DoCart from "../../reducers/cart";
import * as DoExplorer from "../../reducers/explorer";
import * as DoOperation from "../../reducers/operation";
import * as DoUser from "../../reducers/user";
import Operations from "../NewLibrary/components/Operations";
import styles from "./FileBrowser.module.css";
import FileBrowserHeader from "./FileBrowserHeader";
import FileBrowserLoadMore from "./FileBrowserLoadMore";
import FileBrowserTable from "./FileBrowserTable";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);
  const useOperation = useThunk<DoOperation.State, TDoOperation>(DoOperation);
  const [operationID, _setOperationID] = useState(genUUID);

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);
  const explorer = getState(classExplorer) || DoExplorer.defaultState;
  const { isLoading, fileList, linkFileList, subFolderList } = explorer;
  const isLoadMore =
    fileList.results.length !== fileList.count ||
    linkFileList.results.length !== linkFileList.count ||
    subFolderList.results.length !== subFolderList.count;

  const scrollRef = useRef<HTMLDivElement>(null);
  const observeRef = useRef<HTMLDivElement>(null);

  const onClickLoadMore = () => {
    doExplorer.loadMore(explorerID);
  };

  useEffect(() => {
    // auto-click load-more
    if (!scrollRef.current) {
      return;
    }
    if (!observeRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && isLoadMore && !isLoading) {
          onClickLoadMore();
        }
      },
      {
        root: scrollRef.current, //  Use the scrollable container as the viewport
        threshold: 0, // Trigger as soon as any part of the element is visible
        rootMargin: "100px 0px", // Add margin to trigger earlier
      },
    );
    observer.observe(observeRef.current);

    return () => {
      if (!observeRef.current) {
        return;
      }
      observer.unobserve(observeRef.current);
    };
  }, [scrollRef.current, observeRef.current]);

  const classNameLoading = isLoading ? styles.loading : styles.hide;

  return (
    <div className={styles.root}>
      <Operations
        classNames={{
          toolbar: "remove-toolbar-padding",
        }}
        styles={{
          toolbar: {
            backgroundColor: "inherit",
          },
        }}
        useCart={useCart}
        operationID={operationID}
        useOperation={useOperation}
        useUser={useUser}
      />
      <FileBrowserHeader />

      <div className={classNameLoading}>
        <Spinner size="sm" aria-label="Loading files" />
        <span>Loading files...</span>
      </div>

      <div className={styles["file-list"]} ref={scrollRef}>
        <FileBrowserTable />
        <FileBrowserLoadMore
          isLoadMore={isLoadMore}
          ref={observeRef}
          onClick={onClickLoadMore}
        />
      </div>
    </div>
  );
};
