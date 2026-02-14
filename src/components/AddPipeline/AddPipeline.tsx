import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import React, { Fragment, useCallback, useContext } from "react";
import {
  computeWorkflowNodesInfo,
  createWorkflow,
  getWorkflowPluginInstances,
} from "../../api/serverApi";
import type { PluginInstance } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/pluginSlice";
import { Alert, Form, Tag } from "../Antd";
import { SpinContainer } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineContext, Types } from "../PipelinesCopy/context";

type Props = {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  isStaff: boolean;
};
export default (props: Props) => {
  const { addNodeLocally, isStaff } = props;
  const { state, dispatch } = useContext(PipelineContext);
  const { pipelineToAdd, selectedPipeline, computeInfo, titleInfo } = state;
  const reactDispatch = useAppDispatch();
  const { childPipeline } = useAppSelector(
    (state) => state.plugin.nodeOperations,
  );

  const { pluginInstances, selectedPlugin } = useAppSelector(
    (state) => state.instance,
  );

  const alreadyAvailableInstances = pluginInstances.data;

  const handleToggle = useCallback(() => {
    if (childPipeline) {
      dispatch({
        type: Types.ResetState,
      });
      mutation.reset();
    }
    reactDispatch(getNodeOperations("childPipeline"));
  }, [childPipeline, dispatch, reactDispatch]);

  const addPipeline = async () => {
    if (!pipelineToAdd) {
      return;
    }
    const id = pipelineToAdd.id;
    const resources = selectedPipeline?.[id];

    if (selectedPlugin && resources) {
      const { parameters } = resources;

      try {
        const nodes_info = computeWorkflowNodesInfo(parameters);
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

        const {
          status,
          data: workflow,
          errmsg,
        } = await createWorkflow(id, selectedPlugin.data.id, nodes_info);
        if (!workflow) {
          return;
        }

        const {
          status: status2,
          data,
          errmsg: errmsg2,
        } = await getWorkflowPluginInstances(workflow.id, 0, 100);
        const instances = data || [];
        if (instances && alreadyAvailableInstances) {
          addNodeLocally(instances.reverse());
        }
      } catch (e: any) {
        if (e instanceof Error) throw new Error(e.message);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: () => addPipeline(),
  });

  React.useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        handleToggle();
      }, 1000);
    }
  }, [mutation.isSuccess, handleToggle]);

  React.useEffect(() => {
    const el = document.querySelector("#indicators");

    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  const isButtonDisabled = !(
    pipelineToAdd &&
    computeInfo?.[pipelineToAdd.id] &&
    !mutation.isPending
  );

  return (
    <Modal
      variant={ModalVariant.large}
      aria-label="My Pipeline Modal"
      isOpen={childPipeline}
      onClose={handleToggle}
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
        <Button key="cancel" variant="link" onClick={handleToggle}>
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
                  {state.pipelineToAdd.name}
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
