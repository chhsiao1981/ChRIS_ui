import { Button } from "@patternfly/react-core";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router";
import type {
  Plugin,
  PluginInstanceParameter,
  PluginParameter,
} from "../../api/types";
import { SpinContainer } from "../Common";
import FeedNote from "../FeedDetails/FeedNote";
import "./InstanceDetail.css";
import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import * as DoDrawer from "../../reducers/drawer";
import * as DoFeed from "../../reducers/feed";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import InstanceSummary from "./InstanceSummary";
import PluginLog from "./PluginLog";
import { usePluginInstanceResourceQuery } from "./usePluginInstanceResource";
import { getCommand } from "./utils";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

interface INodeState {
  plugin?: Plugin;
  instanceParameters?: PluginInstanceParameter[];
  pluginParameters?: PluginParameter[];
}

function getInitialState() {
  return {
    plugin: undefined,
    instanceParameters: undefined,
    pluginParameters: undefined,
  };
}

type Props = {};

export default (_props: Props) => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );
  const [classDrawer, _] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const { node } = drawer;

  const [classFeed, _2] = useFeed;
  const feedState = getState(classFeed) || DoFeed.defaultState;
  const { data: feed } = feedState;

  const [classPluginInstance, _doPluginInstance] = usePluginInstance;
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance } = pluginInstance;

  const [nodeState, setNodeState] = useState<INodeState>(getInitialState);
  const navigate = useNavigate();
  const { plugin, instanceParameters, pluginParameters } = nodeState;

  useEffect(() => {
    const fetchData = async () => {
      const instanceParameters = await selectedInstance?.getParameters({
        limit: 100,
        offset: 0,
      });

      const plugin = await selectedInstance?.getPlugin();
      const pluginParameters = await plugin?.getPluginParameters({
        limit: 100,
        offset: 0,
      });

      if (plugin && pluginParameters && instanceParameters) {
        setNodeState({
          plugin,
          instanceParameters,
          pluginParameters,
        });
      }
    };

    fetchData();
  }, [selectedInstance]);

  const { data } = usePluginInstanceResourceQuery(selectedInstance);

  const command = getCommand;

  const text =
    plugin && instanceParameters && pluginParameters
      ? command(plugin, instanceParameters, pluginParameters)
      : "";

  return (
    <>
      <SpinContainer title="Loading Node Details" isHide={!!selectedInstance} />
      <ErrorBoundary
        fallback={
          <Button
            onClick={() => {
              feed && navigate(`/feeds/${feed.id}?type='private'`);
            }}
            variant="link"
          >
            Refresh
          </Button>
        }
      >
        <div className="node-details">
          <PluginLog
            isHide={node.currentlyActive !== "terminal"}
            text={text}
            log={data?.pluginLog}
          />
          <FeedNote
            isHide={node.currentlyActive !== "note"}
            useFeed={useFeed}
          />
          <InstanceSummary
            isHide={node.currentlyActive !== "summary"}
            selectedInstance={selectedInstance}
            feed={feed}
            data={data}
          />
        </div>
      </ErrorBoundary>
    </>
  );
};
