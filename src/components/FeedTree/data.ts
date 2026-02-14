import { getPluginInstanceParameters } from "../../api/serverApi/pluginInstance";
import type {
  ID,
  Piping,
  PipingDefaultParameter,
  PluginInstance,
} from "../../api/types";

export interface Datum {
  id?: ID;
  name?: string;
  parentId?: ID;
  item?: PluginInstance;
  children: Datum[];
}

export interface Point {
  x: number;
  y: number;
}

export interface TreeNodeDatum extends Datum {
  children: TreeNodeDatum[];
}

export interface Separation {
  siblings: number;
  nonSiblings: number;
}

export const getFeedTree = (items: PluginInstance[]) => {
  const tree: TreeNodeDatum[] = [];

  const mappedArr = new Map<ID, TreeNodeDatum>();
  const childrenMap = new Map<ID, TreeNodeDatum[]>();

  items.forEach((item) => {
    const id = item.id;
    const previous_id: number | null =
      item.previous_id !== undefined ? item.previous_id : null;
    const node: TreeNodeDatum = {
      id: id,
      name: item.title || item.plugin_name,
      parentId: item.previous_id,
      item: item,
      children: [],
    };
    mappedArr.set(id, node);
    if (previous_id !== null) {
      const parentNode = mappedArr.get(previous_id);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If parent hasn't been processed yet, store the child in childrenMap
        if (!childrenMap.has(previous_id)) {
          childrenMap.set(previous_id, []);
        }
        childrenMap.get(previous_id)!.push(node);
      }
    } else {
      tree.push(node);
    }

    if (childrenMap.has(id)) {
      // If there are children waiting for this node, add them
      const children = childrenMap.get(id)!;
      node.children.push(...children);
      childrenMap.delete(id);
    }
  });
  return tree;
};

export const getTsNodes = async (items: PluginInstance[]) => {
  const parentIds: {
    [key: string]: number[];
  } = {};
  const offset = 0;
  const limit = 20;
  for (let i = 0; i < items.length; i++) {
    const instance = items[i];
    if (instance.plugin_type === "ts") {
      const { status, data, errmsg } = await getPluginInstanceParameters(
        instance.id,
        offset,
        limit,
      );
      const parameters = data || [];
      const filteredParameters = parameters.filter(
        (param) => param.param_name === "plugininstances",
      );
      if (filteredParameters[0]) {
        parentIds[instance.id] = filteredParameters[0].value
          .split(",")
          .map(Number);
      }
    }
  }
  return parentIds;
};

export const getTsNodesWithPipings = async (
  items: Piping[],
  pluginParameters?: PipingDefaultParameter[],
) => {
  const parentIds: {
    [key: string]: number[];
  } = {};

  for (let i = 0; i < items.length; i++) {
    const instance = items[i];

    if (instance.plugin_name === "pl-topologicalcopy") {
      //@ts-expect-error
      pluginParameters.data
        .filter((param: any) => {
          return param.plugin_piping_id === instance.id;
        })
        .forEach((param: any) => {
          if (param.param_name === "plugininstances") {
            parentIds[param.plugin_piping_id] = param.value
              .split(",")
              .map(Number);
          }
        });
    }
  }
  return parentIds;
};
