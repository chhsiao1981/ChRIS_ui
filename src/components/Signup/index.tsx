import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { LoginPage } from "@patternfly/react-core";
import { App, Spin } from "antd";
import type React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as DoSystem from "../../reducers/system";
import SignUpForm from "./SignUpForm";

type TDoSystem = ThunkModuleToFunc<typeof DoSystem>;

export default () => {
  const navigate = useNavigate();

  // Use the message API from Ant Design
  const { message } = App.useApp();

  const useSystem = useThunk<DoSystem.State, TDoSystem>(DoSystem);
  const [classStateSystem, _doSystem] = useSystem;
  const systemID = getDefaultID(classStateSystem);
  const system = getState(classStateSystem) || DoSystem.defaultState;
  const { isAllowRegister } = system;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!systemID) {
      return;
    }

    if (!isAllowRegister) {
      // If sign-ups are not allowed, show error and redirect after delay
      message.error(
        "Anonymous sign-ups are not allowed on this platform. Redirecting to login page...",
        3, // Duration in seconds
      );
      timer = setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirect after 3 seconds
    }

    // Cleanup the timer if the component unmounts
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [systemID, isAllowRegister, navigate, message]);

  // Determine what content to render inside the LoginPage
  let content: React.ReactNode;
  if (!systemID) {
    // Display a loading spinner while checking sign-up availability
    content = (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" tip="Checking sign-up availability..." />
      </div>
    );
  } else if (!isAllowRegister) {
    // Show a message indicating redirecting
    content = (
      <div>
        <p>Redirecting to the login page...</p>
      </div>
    );
  } else {
    // If sign-ups are allowed, render the sign-up form
    content = <SignUpForm />;
  }

  return (
    <LoginPage
      className="login pf-background"
      loginTitle="Sign up for a new account"
    >
      {content}
    </LoginPage>
  );
};
