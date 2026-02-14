import api from "../api";
import type {
  ID,
  PipingDefaultParameter,
  PipingInfo,
  Workflow,
} from "../types";

export const createWorkflow = (
  pipelineID: ID,
  previousPluginInstanceID?: ID,
  nodesInfo?: PipingInfo[],
) => {
  const thePreviousPluginInstanceID = previousPluginInstanceID ?? null;
  return api<Workflow>({
    endpoint: `/pipelines/${pipelineID}/workflows/`,
    method: "post",
    json: {
      template: {
        data: [
          {
            name: "previous_plugin_inst_id",
            value: thePreviousPluginInstanceID,
          },
          { name: "nodes_info", value: JSON.stringify(nodesInfo) },
        ],
      },
    },
    headers: {
      "Content-Type": "application/vnd.collection+json",
    },
  });
};

export const computeWorkflowNodesInfo = (
  params: PipingDefaultParameter[],
  includeAllDefaults = false,
): PipingInfo[] => {
  const pipings: { [key: ID]: PipingInfo } = {};

  for (const defaultParam of params) {
    const pipingId = defaultParam.plugin_piping_id;

    if (!(pipingId in pipings)) {
      pipings[pipingId] = {
        piping_id: pipingId,
        previous_piping_id: defaultParam.previous_plugin_piping_id,
        compute_resource_name: "host",
        title: defaultParam.plugin_piping_title,
        plugin_parameter_defaults: [],
      };
    }

    if (includeAllDefaults || defaultParam.value === null) {
      pipings[pipingId].plugin_parameter_defaults?.push({
        name: defaultParam.param_name,
        default: defaultParam.value,
      });
    }
  }

  const nodesInfo = [];
  for (const pipingId in pipings) {
    if (pipings[pipingId].plugin_parameter_defaults?.length === 0) {
      delete pipings[pipingId].plugin_parameter_defaults;
    }
    nodesInfo.push(pipings[pipingId]);
  }
  return nodesInfo;
};
