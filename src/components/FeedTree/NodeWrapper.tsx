import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useQuery } from "@tanstack/react-query";
import type { HierarchyPointNode } from "d3-hierarchy";
import type { PluginInstance } from "../../api/types";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import type { FeedTreeScaleType } from "./Controls";
import type { Point, TreeNodeDatum } from "./data";
import Node from "./Node";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  tsNodes?: PluginInstance[];
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  onNodeClick: (node: any) => void;
  orientation: "horizontal" | "vertical";
  overlayScale?: FeedTreeScaleType;
  toggleLabel: boolean;
  searchFilter: string;
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;

  isStaff: boolean;
};

export default (props: Props) => {
  const {
    tsNodes,
    data,
    position,
    parent,
    onNodeClick,
    orientation,
    overlayScale,
    toggleLabel,
    searchFilter,
    addNodeLocally,
    isStaff,
  } = props;
  const intitalStatus = data.item?.status;
  const instance = data?.item;

  const activeStatus = useQuery<string | undefined, Error>({
    queryKey: ["pluginInstance", instance?.id],
    queryFn: async (): Promise<string | undefined> => {
      if (instance) {
        const pluginDetails = instance;
        return pluginDetails.status; // e.g. "finishedSuccessfully"
      }
      return undefined;
    },
    enabled: !!instance,
    refetchInterval: (data) => {
      const status = data.state.data;
      if (
        status === "finishedWithError" ||
        status === "cancelled" ||
        status === "finishedSuccessfully"
      ) {
        return false;
      }
      return 7000;
    },
  });

  const usePluginInstance = useThunk<DoPluginInstance.State, TDoPluginInstance>(
    DoPluginInstance,
  );

  const [classStatePluginInstance, _doPluginInstance] = usePluginInstance;
  const pluginInstance =
    getState(classStatePluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance: selectedPlugin } = pluginInstance;
  const isCurrentID = selectedPlugin?.id === data.id;

  let scale: number | undefined;
  if (overlayScale === "time") {
    const instanceData = data.item;
    if (instanceData) {
      const start = new Date(instanceData.start_date);
      const end = new Date(instanceData.end_date);
      scale = Math.log10(end.getTime() - start.getTime()) / 2;
    }
  }

  return (
    <Node
      tsNodes={tsNodes}
      data={data}
      position={position}
      parent={parent}
      onNodeClick={onNodeClick}
      orientation={orientation}
      overlayScale={overlayScale}
      toggleLabel={toggleLabel}
      searchFilter={searchFilter}
      addNodeLocally={addNodeLocally}
      status={activeStatus.data || intitalStatus}
      overlaySize={scale}
      isCurrentID={isCurrentID}
      isStaff={isStaff}
    />
  );
};
