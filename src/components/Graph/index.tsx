import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect, useState } from "react";
import type { Feed } from "../../api/types";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { SpinContainer } from "../Common";
import FeedTree from "../FeedTree/FeedTree";
import Control from "./Control";
import type { Orientation, OverlayScaleType } from "./types";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  feed?: Feed;
  isStaff: boolean;
};

export default (props: Props) => {
  const { feed, isStaff } = props;

  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [isToggleLabel, setIsToggleLabel] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [isScaleEnabled, setIsScaleEnabled] = useState(false);
  const [scaleType, setScaleType] = useState<OverlayScaleType>("time");
  const [isSearch, setIsSearch] = useState(true);
  const [search, setSearch] = useState("");

  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const {
    selectedInstance,
    processingProgress,
    instanceList: pluginInstanceList,
    rootNode,
  } = pluginInstance;

  const pluginInstances = pluginInstanceList.results;

  const lastPluginInstance = !pluginInstances.length
    ? null
    : pluginInstances[pluginInstances.length - 1];

  useEffect(() => {
    // selected-instance default to lastPluginInstance.

    if (!rootNode || selectedInstance || !lastPluginInstance) {
      return;
    }

    doPluginInstance.setSelectedInstance(pluginInstanceID, lastPluginInstance);
  }, [rootNode, selectedInstance, lastPluginInstance, pluginInstanceID]);

  // Show loading spinner only when we have no nodes at all
  return (
    <>
      <SpinContainer
        title={`(${processingProgress}% completed)`}
        isHide={!!rootNode}
      />
      {/* Full-screen progress overlay */}
      {/* <Loading /> XXX never happened */}
      <Control
        orientation={orientation}
        setOrientation={setOrientation}
        isToggleLabel={isToggleLabel}
        setIsToggleLabel={setIsToggleLabel}
        is3D={is3D}
        setIs3D={setIs3D}
        isScaleEnabled={isScaleEnabled}
        setIsScaleEnabled={setIsScaleEnabled}
        scaleType={scaleType}
        setScaleType={setScaleType}
        isSearch={isSearch}
        setIsSearch={setIsSearch}
        search={search}
        setSearch={setSearch}
      />

      <FeedTree
        isHide={is3D}
        isToggleLabel={isToggleLabel}
        search={search}
        orientation={orientation}
        feed={feed}
        isStaff={isStaff}
      />
    </>
  );
};
