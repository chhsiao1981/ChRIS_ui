import type { PluginInstance } from "../../api/types/index.ts";
import constants from "../../datasets/constants.ts";

export const isPlVisualDataset = (plinst: PluginInstance): boolean => {
  const { plugin_name, plugin_version } = plinst;
  return (
    plugin_name === "pl-visual-dataset" && isCompatibleVersion(plugin_version)
  );
};

function isCompatibleVersion(pluginVersion: string): boolean {
  return (
    constants.COMPATIBLE_PL_VISUAL_DATASET_VERSIONS.indexOf(pluginVersion) !==
    -1
  );
}
