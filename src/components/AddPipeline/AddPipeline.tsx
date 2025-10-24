import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { PluginInstance } from "@fnndsc/chrisapi";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { Fragment, useContext, useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import * as DoPlugin from "../../reducers/plugin";
import { NodeOperation } from "../../reducers/types";
import { useAppSelector } from "../../store/hooks";
import { Alert, Form, Tag } from "../Antd";
import { SpinContainer } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineContext, Types } from "../PipelinesCopy/context";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;

type Props = {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  isStaff: boolean;
  usePlugin: UseThunk<DoPlugin.State, TDoPlugin>;
};

export default (props: Props) => {
  const { addNodeLocally, isStaff, usePlugin } = props;
  const [classStatePlugin, doPlugin] = usePlugin;
  const pluginID = getRootID(classStatePlugin);
  const plugin = getState(classStatePlugin) || DoPlugin.defaultState;
  const { nodeOperations } = plugin;
  const childPipeline = nodeOperations[NodeOperation.ChildPipeline] || false;

  const { state, dispatch } = useContext(PipelineContext);
  const { pipelineToAdd, selectedPipeline, computeInfo, titleInfo } = state;

  const { pluginInstances, selectedPlugin } = useAppSelector(
    (state) => state.instance,
  );

  const alreadyAvailableInstances = pluginInstances.data;

  const onToggle = () => {
    if (childPipeline) {
      dispatch({
        type: Types.ResetState,
      });
      mutation.reset();
    }
    doPlugin.toggleNodeOperation(pluginID, NodeOperation.ChildPipeline);
  };

  const addPipeline = async () => {
    const id = pipelineToAdd?.data.id;
    const resources = selectedPipeline?.[id];

    if (selectedPlugin && resources) {
      const { parameters } = resources;
      const client = ChrisAPIClient.getClient();

      try {
        const nodes_info = client.computeWorkflowNodesInfo(parameters.data);
        for (const node of nodes_info) {
          const activeNode = computeInfo?.[id][node.piping_id];
          const titleSet = titleInfo?.[id][node.piping_id];

          if (activeNode) {
            const compute_node = activeNode.currentlySelected;
            node.compute_resource_name = compute_node;
          }

          if (titleSet) {
            node.title = titleSet;
          }
        }

        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin.data.id,
          nodes_info: JSON.stringify(nodes_info),
        });

        const fn = workflow.getPluginInstances;
        const boundFn = fn.bind(workflow);
        const params = { limit: 100, offset: 0 };
        const { resource: instanceItems } = await fetchResource<PluginInstance>(
          params,
          boundFn,
        );
        if (instanceItems && alreadyAvailableInstances) {
          addNodeLocally(instanceItems.reverse());
        }
      } catch (e: any) {
        if (e instanceof Error) throw new Error(e.message);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: () => addPipeline(),
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        onToggle();
      }, 1000);
    }
  }, [mutation.isSuccess]);

  /* XXX seems like no such #indicators.
  useEffect(() => {
    const el = document.querySelector("#indicators");

    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);
  */

  const isButtonDisabled = !(
    pipelineToAdd &&
    computeInfo?.[pipelineToAdd.data.id] &&
    !mutation.isPending
  );

  return (
    <Modal
      variant={ModalVariant.large}
      aria-label="My Pipeline Modal"
      isOpen={childPipeline}
      onClose={onToggle}
      description="Add a Pipeline to the plugin instance"
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => mutation.mutate()}
          isDisabled={isButtonDisabled}
        >
          Confirm
        </Button>,
        <Button key="cancel" variant="link" onClick={onToggle}>
          Cancel
        </Button>,
        <Fragment key="status">
          {state.pipelineToAdd && (
            <div>
              <Form.Item
                style={{ marginBottom: "0" }}
                label="Currently Selected Pipeline"
              >
                <Tag
                  bordered
                  color="#004080"
                  closeIcon
                  onClose={(e) => {
                    e.preventDefault();
                    dispatch({
                      type: Types.PipelineToDelete,
                    });
                  }}
                >
                  {state.pipelineToAdd.data.name}
                </Tag>
              </Form.Item>
            </div>
          )}
        </Fragment>,
      ]}
    >
      <Pipelines isStaff={isStaff} />
      {mutation.isError || mutation.isSuccess || mutation.isPending ? (
        <div id="indicators">
          {mutation.isError && (
            <Alert type="error" description={mutation.error.message} />
          )}
          {mutation.isSuccess && (
            <Alert type="success" description="Pipeline Added" />
          )}
          {mutation.isPending && <SpinContainer title="Adding Pipeline..." />}
        </div>
      ) : null}
    </Modal>
  );
};
