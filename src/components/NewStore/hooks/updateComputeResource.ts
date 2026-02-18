import axios from "axios";
import type { ComputeResource, Plugin } from "../../../api/types";

type props = {
  adminCred: string;
  plugin: Plugin;
  newComputeResources: ComputeResource[];
};

export default async (props: props) => {
  const { adminCred, plugin, newComputeResources } = props;
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );
  if (!adminURL) {
    throw new Error("Please provide a valid chris-admin URL.");
  }
  const computeResourceList = newComputeResources.map((r) => r.name).join(",");
  const pluginData = {
    compute_names: computeResourceList,
    name: plugin.name,
    version: plugin.version,
    plugin_store_url: plugin.url,
  };
  const response = await axios.post(adminURL, pluginData, {
    headers: {
      Authorization: adminCred,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
