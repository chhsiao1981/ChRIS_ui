import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";
import {
  Masthead,
  MastheadContent,
  MastheadToggle,
  PageToggleButton,
} from "@patternfly/react-core";
import type React from "react";
import * as DoFeed from "../../reducers/feed";
import * as DoUser from "../../reducers/user";
import { BarsIcon } from "../Icons";
import Toolbar from "./Toolbar";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  onNavToggle: () => void;
  titleComponent?: React.ReactElement;

  isNavOpen?: boolean;
};

export default (props: Props) => {
  const { onNavToggle, titleComponent, isNavOpen } = props;

  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;

  const userID = getRootID(classStateUser);
  const user = getState(classStateUser) || DoUser.defaultState;

  console.info("Header: user:", user, "userID:", userID);

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [classStateFeed, _2] = useFeed;
  const feed = getState(classStateFeed) || DoFeed.defaultState;

  const { showToolbar } = feed;

  // Apply margin-left to MastheadContent if sidebar is open
  const mastheadContentStyle = {
    marginLeft: isNavOpen ? "12rem" : "0", // Adjust based on sidebar state
  };

  return (
    <Masthead display={{ default: "inline" }}>
      <MastheadToggle style={{ width: "3em" }}>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={true}
          onSidebarToggle={onNavToggle}
          id="multiple-sidebar-body-nav-toggle"
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadContent style={mastheadContentStyle}>
        <Toolbar
          showToolbar={showToolbar}
          token={user.token}
          title={titleComponent}
        />
      </MastheadContent>
    </Masthead>
  );
};
