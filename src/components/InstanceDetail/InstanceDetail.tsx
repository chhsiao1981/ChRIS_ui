import { Button } from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router";
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
  const plugin = selectedInstance?.plugin;
  const instanceParameters = selectedInstance?.instanceParams;
  const pluginParameters = selectedInstance?.pluginParams;

  const navigate = useNavigate();

  const { data } = usePluginInstanceResourceQuery(selectedInstance);

  const text =
    plugin && instanceParameters && pluginParameters
      ? getCommand(plugin, instanceParameters, pluginParameters)
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
