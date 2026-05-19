import { Tbody } from "@patternfly/react-table";
import drawer from "antd/es/drawer";
import { getFileName } from "../../api/common";
import { getLinkFileName } from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import {
  FileRow,
  FolderRow,
  LinkRow,
} from "../NewLibrary/components/LibraryTable";
import SkeletonRows from "./SkeletonRows";

type Props = {
  isLoading: boolean;
  noFiles: boolean;
};
export default (props: Props) => {
  const { isLoading, noFiles } = props;
  const isHideSkeletonRows = !isLoading || !noFiles;
  return (
    <Tbody>
      <SkeletonRows isHide={isHideSkeletonRows} />
      {subFoldersMap?.map((folder, index) => (
        <FolderRow
          key={folder.path}
          rowIndex={index}
          resource={folder}
          name={getFolderName(folder, additionalKey)}
          date={folder.creation_date}
          owner=" "
          size={0}
          computedPath={additionalKey}
          onFolderClick={() => handleFileClick(folder.path)}
          onFileClick={() => {}}
          origin={origin}
          username={username}
          useCart={useCart}
        />
      ))}
      {filesMap?.map((theFile, index) => (
        <FileRow
          key={theFile.fname}
          rowIndex={index}
          resource={theFile}
          name={getFileName(theFile)}
          date={theFile.creation_date}
          owner={theFile.owner_username}
          size={theFile.fsize}
          computedPath={additionalKey}
          onFolderClick={() => {}}
          onFileClick={() => {
            toggleAnimation();
            doExplorer.setSelectedFile(explorerID, theFile);
            !drawer.preview.open && doDrawer.setFilePreviewPanel(drawerID);
          }}
          origin={origin}
          username={username}
          useCart={useCart}
        />
      ))}
      {linkFilesMap?.map((linkFile, index) => (
        <LinkRow
          key={linkFile.path}
          rowIndex={index}
          resource={linkFile}
          name={getLinkFileName(linkFile)}
          date={linkFile.creation_date}
          owner={linkFile.owner_username}
          size={linkFile.fsize}
          computedPath={additionalKey}
          onFolderClick={() => {}}
          onFileClick={async () => {
            /*
                                  try {
                                    const linkedResource =
                                      await linkFile.getLinkedResource();

                                    if (linkedResource) {
                                      // Check if it's a folder (has path property)
                                      if (
                                        "path" in linkedResource.data &&
                                        linkedResource instanceof
                                          FileBrowserFolder
                                      ) {
                                        handleFileClick(
                                          linkedResource.data.path,
                                        );
                                      }
                                      // Check if it's a file (has fname property)
                                      else if (
                                        "fname" in linkedResource &&
                                        linkedResource instanceof
                                          FileBrowserFolderFile
                                      ) {
                                        toggleAnimation();
                                        doExplorer.setSelectedFile(
                                          explorerID,
                                          linkedResource as FileBrowserFolderFile,
                                        );
                                        !drawer.preview.open &&
                                          doDrawer.setFilePreviewPanel(
                                            drawerID,
                                          );
                                      }
                                    }
                                  } catch (error) {
                                    // TODO: Handle error
                                    console.error(
                                      "Error handling link file:",
                                      error,
                                    );
                                  }
                                  */
          }}
          origin={origin}
          username={username}
          useCart={useCart}
        />
      ))}
    </Tbody>
  );
};
