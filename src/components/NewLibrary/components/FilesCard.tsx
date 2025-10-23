import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderFile } from "../../../api/types";
import type * as DoCart from "../../../reducers/cart";
import type * as DoUser from "../../../reducers/user";
import SubFileCard from "./SubFileCard";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  files: FileBrowserFolderFile[];
  computedPath: string;

  useCart: UseThunk<DoCart.State, TDoCart>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const {
    files,
    computedPath,

    useCart,
    useUser,
  } = props;

  return (
    <>
      {files.map((eachFile) => (
        <SubFileCard
          key={eachFile.fname}
          theFile={eachFile}
          computedPath={computedPath}
          useUser={useUser}
          useCart={useCart}
        />
      ))}
    </>
  );
};
