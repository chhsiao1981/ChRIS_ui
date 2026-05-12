import {
  getDefaultID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { ReactNode } from "react";
import type * as DoDrawer from "../../reducers/drawer";
import type { ActionType } from "../../reducers/drawer";
import ButtonWithTooltip from "../DrawerUtils/ButtonWithTooltip";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {
  actionType: ActionType;
  icon: ReactNode;
  title: string;
  isDisabled: boolean;

  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
};

export default (props: Props) => {
  const { actionType, icon, title, isDisabled, useDrawer } = props;
  const [classDrawer, doDrawer] = useDrawer;
  const drawerID = getDefaultID(classDrawer);
  return (
    <ButtonWithTooltip
      content={<span>{title}</span>}
      position="bottom"
      className="button-style large-button"
      Icon={icon}
      onClick={() => {
        doDrawer.toggle(drawerID, actionType);
      }}
      isDisabled={isDisabled}
    />
  );
};
