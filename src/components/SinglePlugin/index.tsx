import { useQuery } from "@tanstack/react-query";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchResource } from "../../api/common";
import type {
  ID,
  Plugin,
  PluginInstance,
  PluginMeta,
  PluginParameter,
} from "../../api/types";
import { unpackParametersIntoString } from "../AddNode/utils";
import { Alert } from "../Antd";
import { EmptyStateComponent, SpinContainer } from "../Common";
import Wrapper from "../Wrapper";
import {
  HeaderCardPlugin,
  HeaderSinglePlugin,
  type ParameterPayload,
} from "./PluginCatalogComponents";
import "./singlePlugin.css";
import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { id } from "fp-ts/lib/Refinement";
import plugin from "vite-plugin-babel-macros";
import { getPluginsByPluginMeta } from "../../api/serverApi/plugin";
import { getPluginMeta } from "../../api/serverApi/pluginMeta";
import * as DoUser from "../../reducers/user";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

export default () => {
  const useUser = useThunk<DoUser.State, TDoUser>(DoUser);
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;

  const { id } = useParams() as { id: string };
  const [parameterPayload, setParameterPayload] = useState<ParameterPayload>();

  // Function to fetch the Readme from the Repo.
  const fetchReadme = async (currentPluginMeta: PluginMeta) => {
    const repo = currentPluginMeta.public_repo.split("github.com/")[1];
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      return;
    }
    const { download_url, content }: { download_url: string; content: string } =
      await ghreadme.json();
    const file = atob(content);
    let fileToSanitize = "";
    const type: string = download_url.split(".").reverse()[0];

    if (type === "md" || type === "rst") {
      fileToSanitize = micromark(file, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
      });
    } else {
      fileToSanitize = file;
    }

    return fileToSanitize;
  };

  const fetchPlugins = async (id: ID) => {
    const { status, data: pluginMeta, errmsg } = await getPluginMeta(id);
    if (!pluginMeta) {
      return;
    }

    document.title = pluginMeta.name;

    const {
      status: _status2,
      data: data2,
      errmsg: _errmsg2,
    } = await getPluginsByPluginMeta(pluginMeta.id, 0, 1000);
    const plugins = data2 || [];
    const readme = await fetchReadme(pluginMeta);
    return {
      currentPluginMeta: pluginMeta,
      plugins: plugins,
      readme,
    };
  };

  const setPluginParameters = useCallback(
    async (plugin: Plugin) => {
      let generatedCommand = "";
      const params = { limit: 10, offset: 0 };
      const fn = plugin.getPluginParameters;
      const computeFn = plugin.getPluginComputeResources;

      const boundFn = fn.bind(plugin);
      const boundComputeFn = computeFn.bind(plugin);
      const { resource: parameters } = await fetchResource<PluginParameter>(
        params,
        boundFn,
      );

      const { resource: computes } = isLoggedIn
        ? await fetchResource(params, boundComputeFn)
        : { resource: [] };

      const pluginInstances = isLoggedIn
        ? ((
            await plugin.getPluginInstances({
              limit: 1000,
            })
          ).getItems() as PluginInstance[])
        : [];

      if (parameters.length > 0) {
        for (const param of parameters) {
          const generateInput = {
            [param.id]: {
              flag: param.flag,
              id: param.id,
              paramName: param.name,
              type: param.type,
              value: param.default
                ? param.default
                : param.type !== "boolean"
                  ? "' '"
                  : "",
            },
          };
          generatedCommand += unpackParametersIntoString(generateInput);
        }

        setParameterPayload({
          generatedCommand,
          version: plugin.version,
          url: plugin.url,
          computes: computes,
          pluginInstances: pluginInstances,
        });
      }
    },
    [isLoggedIn],
  );

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["pluginData", id],
    queryFn: () => fetchPlugins(+id),
    enabled: !!id,
  });

  const removeEmail = (authors: string | string[]) => {
    let authorArray: string[] = [];
    const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
    // Match '<' or '(' at the beginning and end
    // Match <string>@<host>.<tld> inside brackets
    if (!Array.isArray(authors)) {
      authorArray = [authors];
    } else authorArray = authors;
    // eslint-disable-next-line no-param-reassign

    return authorArray.map((author) => author.replace(emailRegex, "").trim());
  };

  useEffect(() => {
    if (data?.plugins && data.plugins.length > 0) {
      setPluginParameters(data.plugins[0]);
    }
  }, [data?.plugins[0], setPluginParameters]);

  return (
    <Wrapper>
      {isLoading || isFetching ? (
        <SpinContainer title="Please wait as resources for this plugin are being fetched..." />
      ) : isError ? (
        <Alert type="error" description={error.message} />
      ) : data ? (
        <>
          <HeaderSinglePlugin currentPluginMeta={data.currentPluginMeta} />
          <HeaderCardPlugin
            setPluginParameters={setPluginParameters}
            plugins={data.plugins}
            currentPluginMeta={data.currentPluginMeta}
            readme={data.readme}
            parameterPayload={parameterPayload}
            removeEmail={removeEmail}
          />
        </>
      ) : (
        <EmptyStateComponent />
      )}
    </Wrapper>
  );
};
