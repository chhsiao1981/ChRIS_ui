import type { PluginInstance } from "../../api/types/index.ts";
import constants from "../../datasets/constants.ts";

export const isInstanceVisualDataset = (instance?: PluginInstance): boolean => {
  if (!instance) {
    return false;
  }
  const { plugin_name, plugin_version } = instance;
  return (
    plugin_name === "pl-visual-dataset" && isCompatibleVersion(plugin_version)
  );
};

const isCompatibleVersion = (pluginVersion: string): boolean => {
  return (
    constants.COMPATIBLE_PL_VISUAL_DATASET_VERSIONS.indexOf(pluginVersion) !==
    -1
  );
};
