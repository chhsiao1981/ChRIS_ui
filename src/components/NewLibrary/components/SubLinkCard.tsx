import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { type FormEvent, type MouseEvent, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import type { FileBrowserFolderLinkFile } from "../../../api/types";
import type * as DoCart from "../../../reducers/cart";
import { PathType } from "../../../reducers/types";
import useDownload, { useAppSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import { OperationContext } from "../context";
import getBackgroundRowColor from "../utils/getBackgroundRowColor";
import getLinkFileName from "../utils/getLinkFileName";
import useLongPress from "../utils/useLongPress";
import Presentation from "./Presentation";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  linkFile: FileBrowserFolderLinkFile;
  computedPath: string;

  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { linkFile, computedPath, username, useCart } = props;
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const download = useDownload();
  const { handlers } = useLongPress(useCart);
  const [api, contextHolder] = notification.useNotification();

  const linkName = getLinkFileName(linkFile);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === linkFile.path,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  const icon = <ExternalLinkSquareAltIcon />;

  useEffect(() => {
    if (download.isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });
      setTimeout(() => download.reset(), 1000);
    }

    if (download.isError) {
      api.error({
        message: "Download Error",
        description: download.error?.message,
      });
    }
  }, [download.isSuccess, download.isError, api, download]);

  const onClick = (e: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    handlers.onClick(e, linkFile, linkFile.path, PathType.Link, () => {
      navigate(linkFile.path);
    });
  };

  const onChangeCheckbox = (e: FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.onChangeCheckbox(e, linkFile.path, linkFile, PathType.Link);
  };

  return (
    <>
      {contextHolder}
      <Presentation
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={onClick}
        onMouseDown={handlers.onMouseDown}
        onCheckboxChange={onChangeCheckbox}
        onContextMenuClick={onClick}
        onNavigate={() => navigate(linkFile.path)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={linkName}
        date={linkFile.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
        username={username}
      />
    </>
  );
};
