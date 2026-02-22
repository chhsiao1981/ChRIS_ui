import {
  Button,
  ListVariant,
  LoginMainFooterBandItem,
  LoginPage,
} from "@patternfly/react-core";
import { Link, redirect } from "react-router-dom";
import ChRIS_Logo from "../../assets/chris-logo.png";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import "./Login.css";
import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import config from "config";
import * as DoSystem from "../../reducers/system";
import FooterListItems from "./FooterListItems.tsx";

type TDoSystem = ThunkModuleToFunc<typeof DoSystem>;

const { OIDC_URL, OIDC_PROMPT } = config;

export default () => {
  // Use the custom hook

  const useSystem = useThunk<DoSystem.State, TDoSystem>(DoSystem);
  const [classStateSystem, _doSystem] = useSystem;
  const system = getState(classStateSystem) || DoSystem.defaultState;
  const { isAllowRegister } = system;

  // Conditionally render the "Sign up" link based on signUpAllowed state
  const signUpForAccountMessage = isAllowRegister ? (
    <LoginMainFooterBandItem>
      Need an account? <Link to="/signup">Sign up.</Link>
    </LoginMainFooterBandItem>
  ) : null;

  const forgotCredentials = (
    <LoginMainFooterBandItem>
      <span>Contact a ChRIS admin to reset your username or password</span>
    </LoginMainFooterBandItem>
  );

  const onClickLegacyLogin = () => {
    const queryString = window.location.search;
    redirect(`/login-legacy${queryString}`);
  };

  const onClickOIDCLogin = () => {
    redirect(OIDC_URL);
  };

  return (
    <LoginPage
      className="login pf-background"
      footerListVariants={ListVariant.inline}
      brandImgSrc={window.innerWidth < 1200 ? ChRIS_Logo_Inline : ChRIS_Logo}
      brandImgAlt="ChRIS logo"
      footerListItems={FooterListItems}
      textContent="ChRIS is a general-purpose, open source, distributed data and computation platform that connects a community of researchers, developers, and clinicians together."
      loginTitle="Log in to your account"
      loginSubtitle="Enter your credentials."
      signUpForAccountMessage={signUpForAccountMessage}
      forgotCredentials={forgotCredentials}
    >
      <Button
        variant="plain"
        aria-label="Add primary circle variant"
        onClick={onClickOIDCLogin}
      >
        {OIDC_PROMPT}
      </Button>
      <br />
      <Button
        variant="plain"
        aria-label="Add primary circle variant"
        onClick={onClickLegacyLogin}
      >
        Username Login
      </Button>
    </LoginPage>
  );
};
