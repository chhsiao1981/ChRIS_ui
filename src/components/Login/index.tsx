import {
  Button,
  ListVariant,
  LoginMainFooterBandItem,
  LoginPage,
} from "@patternfly/react-core";
import { Link } from "react-router-dom";
import ChRIS_Logo from "../../assets/chris-logo.png";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import "./Login.css";

import config from "config";

const { OIDC_URL, OIDC_PROMPT } = config;

import { useSignUpAllowed } from "../../store/hooks.ts";
import FooterListItems from "./FooterListItems.tsx";

export default () => {
  // Use the custom hook
  const { signUpAllowed } = useSignUpAllowed();

  // Conditionally render the "Sign up" link based on signUpAllowed state
  const signUpForAccountMessage = signUpAllowed ? (
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
    window.location.href = `/login-legacy${queryString}`;
  };

  const onClickOIDCLogin = () => {
    window.location.href = OIDC_URL;
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
