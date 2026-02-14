/**
 * Utils to be abstracted out
 */
import type { PluginInstance } from "../../api/types";

export const bytesToSize = (bytes: number) => {
  const sizes: string[] = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "N/A";
  // biome-ignore lint/correctness/useParseIntRadix: no need to setup radix.
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(0)} ${sizes[i]}`;
};

// Format plugin name to "Name_vVersion_ID"
export const getPluginName = (plugin: PluginInstance) => {
  const title = plugin.title || plugin.plugin_name;
  return title;
};

// Format plugin name to "Name v. Version"
export const getPluginDisplayName = (plugin: PluginInstance) => {
  return `${plugin.plugin_name} v. ${plugin.plugin_version}`;
};
