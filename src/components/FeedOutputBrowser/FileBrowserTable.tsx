import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Table, Tbody } from "@patternfly/react-table";
import { getFileName } from "../../api/common";
import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "../../api/types";
import * as DoCart from "../../reducers/cart";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoUser from "../../reducers/user";
import { getLinkFileName } from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import {
  FileRow,
  FolderRow,
  LinkRow,
} from "../NewLibrary/components/LibraryTable";
import { OperationContext } from "../NewLibrary/context";
import FileBrowserThead from "./FileBrowserThead";
import SkeletonRows from "./SkeletonRows";

type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classUser, _doUser] = useUser;
  const user = getState(classUser) || DoUser.defaultState;
  const { username } = user;

  const useCart = useThunk<DoCart.State, TDoCart>(DoCart);

  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawerID = getDefaultID(classDrawer);

  const useExplorer = useThunk<DoExplorer.State, TDoExplorer>(DoExplorer);
  const [classExplorer, doExplorer] = useExplorer;
  const explorerID = getDefaultID(classExplorer);
  const explorer = getState(classExplorer) || DoExplorer.defaultState;
  const { fileList, linkFileList, subFolderList, path } = explorer;
  const isNoFiles =
    fileList.results.length === 0 &&
    linkFileList.results.length === 0 &&
    subFolderList.results.length === 0;

  const onFileClick = (theFile: FileBrowserFolderFile) => {
    doExplorer.setSelectedFile(explorerID, theFile, useDrawer);
    doDrawer.openPreviewPanel(drawerID);
  };

  const onLinkFileClick = (linkFile: FileBrowserFolderLinkFile) => {
    doExplorer.setSelectedLinkFile(explorerID, linkFile, useDrawer);
  };

  const onFolderClick = (path: string) => {
    doExplorer.setSelectedFolder(explorerID, path, useDrawer);
  };
  const origin = {
    type: OperationContext.FILEBROWSER,
    additionalKeys: [path],
  };

  return (
    <Table
      style={{
        backgroundColor: "inherit",
      }}
      variant="compact"
      isStickyHeader={true}
    >
      <FileBrowserThead />
      <Tbody>
        <SkeletonRows isHide={!isNoFiles} />
        {fileList.results.map((theFile, index) => (
          <FileRow
            key={theFile.fname}
            rowIndex={index}
            resource={theFile}
            name={getFileName(theFile.fname)}
            date={theFile.creation_date}
            owner={theFile.owner_username}
            size={theFile.fsize}
            computedPath={path}
            onFolderClick={() => {}}
            onFileClick={() => onFileClick(theFile)}
            origin={origin}
            username={username}
            useCart={useCart}
          />
        ))}
        {linkFileList.results.map((linkFile, index) => (
          <LinkRow
            key={linkFile.path}
            rowIndex={index}
            resource={linkFile}
            name={getLinkFileName(linkFile)}
            date={linkFile.creation_date}
            owner={linkFile.owner_username}
            size={linkFile.fsize}
            computedPath={path}
            onFolderClick={() => {}}
            onFileClick={() => onLinkFileClick(linkFile)}
            origin={origin}
            username={username}
            useCart={useCart}
          />
        ))}
        {subFolderList.results.map((subFolder, index) => (
          <FolderRow
            key={subFolder.path}
            rowIndex={index}
            resource={subFolder}
            name={getFolderName(subFolder, path)}
            date={subFolder.creation_date}
            owner=" "
            size={0}
            computedPath={path}
            onFolderClick={() => onFolderClick(subFolder.path)}
            onFileClick={() => {}}
            origin={origin}
            username={username}
            useCart={useCart}
          />
        ))}
      </Tbody>
    </Table>
  );
};
