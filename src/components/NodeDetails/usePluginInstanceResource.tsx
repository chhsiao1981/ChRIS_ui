import { useQuery } from "@tanstack/react-query";
import { inflate, inflateRaw } from "pako";
import { getPluginInstance } from "../../api/serverApi/pluginInstance";
import type { PluginInstance } from "../../api/types";
import { getStatusLabels, type PluginStatusLabels } from "./utils";

// Reuse your getLog function
function getLog(raw: string) {
  // Step 1: Decode base64
  const strData = atob(raw);

  // Try "deflate"
  try {
    const inflatedData = inflate(strData, { to: "string" });
    return JSON.parse(inflatedData);
  } catch (error1) {
    console.error("Error inflating with deflate:", error1);

    // Try "zlib"
    try {
      const inflatedData = inflateRaw(strData, { to: "string" });
      return JSON.parse(inflatedData);
    } catch (error2) {
      console.error("Error inflating with zlib:", error2);
    }
  }
  console.error("Unable to inflate the data.");
  return null;
}

interface PluginInstanceResource {
  status: string | undefined;
  pluginStatus: any; // e.g. an array of step labels
  pluginLog: any; // e.g. parsed logs
  pluginDetails: any; // the raw data from the plugin instance
  previousStatus: string;
}

export function usePluginInstanceResourceQuery(instance?: PluginInstance) {
  return useQuery<PluginInstanceResource | null, Error>({
    queryKey: ["pluginInstanceResource", instance?.id],
    queryFn: async () => {
      // Bail out if we don’t have an instance
      if (!instance) return null;

      // 1) Fetch current plugin instance details safely

      const {
        status: _status,
        data: pluginDetails,
        errmsg,
      } = await getPluginInstance(instance.id);
      if (!pluginDetails) {
        return null;
      }

      const status = pluginDetails.status;

      // 2) Parse pluginStatus JSON from `data.summary`
      let parsedStatus: PluginStatusLabels = {};
      const pluginStatusJson = pluginDetails.summary;
      if (pluginStatusJson) {
        parsedStatus = JSON.parse(pluginStatusJson) as PluginStatusLabels;
      }

      // 3) Parse logs from base64 "raw" field
      let output = {};
      const rawField = pluginDetails.raw;
      if (rawField && rawField.length > 0) {
        const parsedLog = getLog(rawField);
        if (parsedLog) {
          output = parsedLog;
        }
      }

      // 4) Fetch the previous instance’s status (if applicable)
      let previousStatus = "";
      const previousInstanceId = instance.previous_id;
      if (previousInstanceId) {
        const {
          status,
          data: previousInstance,
          errmsg,
        } = await getPluginInstance(previousInstanceId);

        if (previousInstance) {
          previousStatus = previousInstance.status;
        }
      }

      const pluginStatus = getStatusLabels(
        parsedStatus,
        pluginDetails,
        previousStatus,
      );

      return {
        status,
        pluginStatus,
        pluginLog: output,
        pluginDetails,
        previousStatus,
      };
    },
    enabled: !!instance,

    // In React Query v4, refetchInterval receives a QueryObserverResult
    refetchInterval: (result) => {
      const data = result.state.data;

      // Stop polling if the plugin is in a terminal state
      if (
        data?.status === "finishedWithError" ||
        data?.status === "cancelled" ||
        data?.status === "finishedSuccessfully"
      ) {
        return false;
      }

      // Otherwise, keep polling every 7 seconds
      return 7000;
    },
  });
}
