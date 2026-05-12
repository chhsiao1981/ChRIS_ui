import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button } from "@patternfly/react-core";
import type { ChangeEvent, CSSProperties } from "react";
import type { FileBrowserType } from "../../../../api/types/fileBrowser";
import * as DoOperation from "../../../../reducers/operation";
import { Dropdown } from "../../../Antd";
import { AddIcon } from "../../../Icons";

type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;

type OperationItem = {
  key: "fileUpload" | "folderUpload";
  label: string;
  disabled: boolean;
};

const OPERATION_ITEMS: OperationItem[] = [
  {
    key: "fileUpload",
    label: "Upload Files",
    disabled: false,
  },
  {
    key: "folderUpload",
    label: "Upload Folder",
    disabled: false,
  },
];

type Props = {
  isSidebar?: boolean;

  buttonColor?: string;

  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;
};

export default (props: Props) => {
  const {
    isSidebar: propsIsSidebar,
    buttonColor,

    operationID,
    useOperation,
  } = props;

  const [classOperation, doOperation] = useOperation;
  const operation =
    getState(classOperation, operationID) || DoOperation.defaultState;
  const { fileInputRef, folderInputRef } = operation;

  const isSidebar = propsIsSidebar || false;
  const buttonVariant = isSidebar ? "plain" : "primary";

  const style: CSSProperties = {};
  if (isSidebar) {
    style.color = buttonColor;
    style.paddingTop = "8px";
    style.paddingLeft = "24px";
    style.paddingBottom = "8px";
    style.paddingRight = "24px";
  }
  const buttonSize = isSidebar ? undefined : "sm";

  const refMap = {
    fileUpload: fileInputRef,
    folderUpload: folderInputRef,
  };

  const onChange = (
    e: ChangeEvent<HTMLInputElement>,
    theType: FileBrowserType,
  ) => {
    if (!e.target.files) {
      return;
    }
    doOperation.createFeedWithFile(operationID, e.target.files, theType);
  };

  return (
    <>
      <Dropdown
        menu={{
          items: OPERATION_ITEMS,
          selectable: true,
          // @ts-expect-error info is OperationItem.
          onClick: (info: OperationItem) => refMap[info.key].current?.click(),
        }}
      >
        <Button
          size={buttonSize}
          variant={buttonVariant}
          icon={
            <AddIcon
              style={{ color: "inherit", height: "1em", width: "1em" }}
            />
          }
          style={style}
        >
          Upload Data
          <input
            ref={fileInputRef}
            multiple
            type="file"
            hidden
            onChange={(e) => onChange(e, "file")}
          />
          <input
            ref={folderInputRef}
            type="file"
            hidden
            webkitdirectory=""
            directory=""
            onChange={(e) => onChange(e, "folder")}
          />
        </Button>
      </Dropdown>
    </>
  );
};
