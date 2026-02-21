import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { App } from "antd";
import config from "config";
import { useEffect } from "react";

export const useSignUpAllowed = () => {
  // Use the message API from Ant Design
  const { message } = App.useApp();

  const fetchSignUpAllowed = async (): Promise<boolean> => {
    const apiUrl = `${config.SIGNUP_ROOT}${config.SIGNUP_ENDPOINT}`;

    if (!apiUrl) {
      throw new Error("URL for fetching the users is not set correctly");
    }

    // Make an unauthenticated OPTION request to api/v1/users/
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    // Get the Allow header from the response
    const allowHeader = response.headers.get("Allow");

    return allowHeader?.includes("POST") || false;
  };

  // Explicitly define the type for options
  const queryOptions: UseQueryOptions<
    boolean,
    Error,
    boolean,
    ["signUpAllowed"]
  > = {
    queryKey: ["signUpAllowed"],
    queryFn: fetchSignUpAllowed,
    retry: false,
  };

  const {
    data: signUpAllowed,
    isLoading,
    isError,
    error,
  } = useQuery<boolean, Error, boolean, ["signUpAllowed"]>(queryOptions);

  // Handle errors using useEffect
  useEffect(() => {
    if (isError && error) {
      message.error(
        error.message ||
          "Failed to check sign-up availability. Please try again later.",
        3, // Duration in seconds
      );
    }
  }, [isError, error, message]);

  return { signUpAllowed, isLoading, isError, error };
};
