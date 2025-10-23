import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderLinkFile } from "../../../api/types";
import type * as DoCart from "../../../reducers/cart";
import SubLinkCard from "./SubLinkCard";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

type Props = {
  linkFiles: FileBrowserFolderLinkFile[];
  computedPath: string;

  username: string;
  useCart: UseThunk<DoCart.State, TDoCart>;
};

export default (props: Props) => {
  const { linkFiles, computedPath, username, useCart } = props;
  return (
    <>
      {linkFiles.map((val) => (
        <SubLinkCard
          key={val.fname}
          linkFile={val}
          computedPath={computedPath}
          username={username}
          useCart={useCart}
        />
      ))}
    </>
  );
};
