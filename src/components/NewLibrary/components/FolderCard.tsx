import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { Fragment } from "react/jsx-runtime";
import type { FileBrowserFolder } from "../../../api/types";
import type * as DoCart from "../../../reducers/cart";
import type * as DoUser from "../../../reducers/user";
import SubFolderCard from "./SubFolderCard";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  folders: FileBrowserFolder[];
  onFolderClick: (path: string) => void;
  computedPath: string;
  pagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };

  useCart: UseThunk<DoCart.State, TDoCart>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { folders, onFolderClick, computedPath, useCart, useUser } = props;
  return (
    <Fragment>
      {folders.map((folder) => {
        return (
          <SubFolderCard
            key={`sub_folder_${folder.path}`}
            folder={folder}
            computedPath={computedPath}
            onFolderClick={onFolderClick}
            useCart={useCart}
            useUser={useUser}
          />
        );
      })}
    </Fragment>
  );
};
