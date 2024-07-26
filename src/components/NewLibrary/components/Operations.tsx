import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  Modal,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  type DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { MenuProps } from "antd";
import { Alert, Dropdown, Spin } from "antd";
import axios from "axios";
import { Fragment, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { getFileName, getTimestamp } from "../../../api/common";
import {
  clearCart,
  removeIndividualSelection,
  startDownload,
  startUpload,
} from "../../../store/cart/actions";
import { useTypedSelector } from "../../../store/hooks";
import { AddIcon } from "../../Icons";

const AddModal = ({
  isOpen,
  onClose,
  onSubmit,
  modalTitle,
  inputLabel,
  indicators,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
  modalTitle: string;
  inputLabel: string;
  indicators: {
    isPending: boolean;
    isError: boolean;
    error: DefaultError | null;
  };
}) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      variant="small"
      aria-label={modalTitle}
      title={modalTitle}
      onClose={onClose}
    >
      <Form>
        <FormGroup>
          <TextInput
            name="input"
            value={inputValue}
            onChange={(_e, value) => setInputValue(value)}
            aria-label={inputLabel}
            placeholder={inputLabel}
          />
        </FormGroup>
        <ActionGroup>
          <Button
            icon={indicators.isPending && <Spin />}
            onClick={() => onSubmit(inputValue)}
          >
            Confirm
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ActionGroup>

        {indicators.isError && (
          <Alert type="error" description={indicators.error?.message} />
        )}
      </Form>
    </Modal>
  );
};

const items: MenuProps["items"] = [
  {
    key: "1",
    label: "New Folder",
  },
  {
    key: "2",
    label: "File Upload",
  },
  {
    key: "3",
    label: "Folder Upload",
  },
  {
    key: "4",
    label: "Create a Group",
  },
];

const Operations = ({
  folderList,
  computedPath,
}: { folderList?: FileBrowserFolderList; computedPath: string }) => {
  const queryClient = useQueryClient();
  const { selectedPaths } = useTypedSelector((state) => state.cart);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    type: "", // "group" or "folder"
  });

  const username = useTypedSelector((state) => state.user.username);
  const dispatch = useDispatch();
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedPathsCount = selectedPaths.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);

    // Setting the directory name to a default timestamp. Might need to swap out this code to allow users to provide directory name
    const directoryName = getTimestamp();

    dispatch(
      startUpload({
        files: files,
        isFolder: false,
        currentPath: `home/${username}/uploads/${directoryName}`,
      }),
    );

    // Reset file input
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);

    dispatch(
      startUpload({
        files: files,
        isFolder: true,
        currentPath: `home/${username}/uploads`,
      }),
    );
    // Reset folder input
    if (folderInput.current) {
      folderInput.current.value = "";
    }
  };

  const handleModalSubmit = async (inputValue: string) => {
    if (modalInfo.type === "group") {
      const client = ChrisAPIClient.getClient();
      await client.adminCreateGroup({ name: inputValue });
    } else if (modalInfo.type === "folder") {
      //Folders cannot be created inside the root directory
      // Logic to create a new folder using folderList
      // If the compute path is "/", the user may be trying to create a directory in the root path. Throw an error
      if (!computedPath.startsWith("home")) {
        throw new Error(
          "You don't have permissions to create a folder at this level. Please navigate to the home folders to create a folder.",
        );
      }

      const finalPath = `${computedPath}/${inputValue}`;
      try {
        await folderList?.post({
          path: finalPath,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data || error.message;
          throw new Error(errorMessage);
        }
      }
    }
    setModalInfo({ isOpen: false, type: "" });
  };

  const handleModalSubmitMutation = useMutation({
    mutationFn: (inputValue: string) => handleModalSubmit(inputValue),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });
    },
  });

  const { isPending, isError, error } = handleModalSubmitMutation;

  const toolbarItems = (
    <Fragment>
      <ToolbarItem>
        <Dropdown
          menu={{
            items,
            selectable: true,
            onClick: (info) => {
              if (info.key === "1") {
                setModalInfo({ isOpen: true, type: "folder" });
              }

              if (info.key === "3") {
                folderInput.current?.click();
              }
              if (info.key === "2") {
                fileInput.current?.click();
              }

              if (info.key === "4") {
                setModalInfo({ isOpen: true, type: "group" });
              }
            },
          }}
        >
          <Button
            icon={
              <AddIcon
                style={{
                  color: "inherit",
                  height: "1em",
                  width: "1em",
                }}
              />
            }
          >
            New
          </Button>
        </Dropdown>
      </ToolbarItem>
      {selectedPaths.length > 0 && (
        <>
          <ToolbarItem>
            <Button>Create Feed</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              onClick={() => {
                dispatch(startDownload(selectedPaths));
              }}
            >
              Download
            </Button>
          </ToolbarItem>
        </>
      )}

      {selectedPathsCount > 0 && (
        <ToolbarItem
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ChipGroup
            numChips={3}
            isClosable
            onClick={() => {
              dispatch(clearCart());
            }}
            className="chip-group-for-paths"
            expandedText="Show Less"
          >
            {selectedPaths.map((payload) => {
              return (
                <Chip
                  onClick={() => {
                    dispatch(removeIndividualSelection(payload));
                  }}
                  key={payload.payload.data.id}
                >
                  {getFileName(payload.path)}
                </Chip>
              );
            })}
          </ChipGroup>
        </ToolbarItem>
      )}
    </Fragment>
  );

  return (
    <>
      <Toolbar
        style={{
          paddingLeft: "0",
        }}
        id="action-tray"
      >
        <ToolbarContent
          style={{
            paddingInlineStart: "0",
          }}
        >
          {toolbarItems}
        </ToolbarContent>
      </Toolbar>

      <input
        ref={folderInput}
        type="file"
        style={{ display: "none" }}
        //@ts-ignore
        webkitdirectory="true"
        directory="true"
        onChange={handleFolderChange}
        multiple
      />
      <input
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
        accept="files"
        onChange={handleFileChange}
        multiple
      />

      <AddModal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, type: "" })}
        onSubmit={(inputValue) => {
          handleModalSubmitMutation.mutate(inputValue);
        }}
        modalTitle={
          modalInfo.type === "group" ? "Create Group" : "Create Folder"
        }
        inputLabel={modalInfo.type === "group" ? "Group Name" : "Folder Name"}
        indicators={{
          isPending,
          isError,
          error,
        }}
      />
    </>
  );
};

export default Operations;
