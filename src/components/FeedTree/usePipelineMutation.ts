import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { useEffect } from "react";
import {
  createWorkflow,
  getPipelines,
  getWorkflowPluginInstances,
} from "../../api/serverApi";
import type { PluginInstance } from "../../api/types";
import {
  getSelectedPlugin,
  setPluginInstancesAndSelectedPlugin,
} from "../../store/pluginInstance/pluginInstanceSlice";

export default (
  selectedPlugin: PluginInstance | undefined,
  pluginInstances: PluginInstance[],
  dispatch: any,
) => {
  const [api, contextHolder] = notification.useNotification();

  const fetchPipelines = async () => {
    try {
      const { status, data, errmsg } = await getPipelines("zip v20240311");
      const pipelines = data || [];

      if (pipelines && pipelines.length > 0) {
        const pipeline = pipelines[0];
        const { id } = pipeline;

        const {
          status: status2,
          data: workflow,
          errmsg: errmsg2,
        } = await createWorkflow(id, selectedPlugin?.id, []);
        if (!workflow) {
          return;
        }

        const {
          status: status3,
          data: data3,
          errmsg: errmsg3,
        } = await getWorkflowPluginInstances(workflow.id, 0, 1000);
        const instances = data3 || [];
        if (instances && instances.length > 0) {
          const firstInstance = instances[instances.length - 1];
          const completeList = [...pluginInstances, ...instances];

          dispatch(getSelectedPlugin(firstInstance));

          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };

          dispatch(setPluginInstancesAndSelectedPlugin(pluginInstanceObj));
          //dispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }
      } else {
        throw new Error(
          "The pipeline to zip is not registered. Please contact an admin",
        );
      }
      return pipelines;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: some unknown error.
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: fetchPipelines,
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      api.success({
        message: "Zipping process started...",
      });
      mutation.reset();
    } else if (mutation.isError) {
      api.error({
        message: (mutation.error as Error).message,
      });
    } else if (mutation.isPending) {
      api.info({
        message: "Preparing to initiate the zipping process...",
      });
    }
  }, [
    api,
    mutation.error,
    mutation.isSuccess,
    mutation.isError,
    mutation.isPending,
    mutation.reset,
  ]);

  return { mutation, contextHolder };
};
