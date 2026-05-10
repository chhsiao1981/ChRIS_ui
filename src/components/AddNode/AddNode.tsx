import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import { useCallback, useContext } from "react";
import { Alert } from "../Antd";
import {
  getParameterInput,
  sanitizeAdvancedConfig,
} from "../CreateFeed/createFeedHelper";
import BasicConfiguration from "./BasicConfiguration";
import GuidedConfig from "./GuidedConfig";
import "./add-node.css";
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { createPluginInstance } from "../../api/serverApi";
import type { PluginInstance } from "../../api/types";
import * as DoAddNode from "../../reducers/addNode";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { AddNodeContext } from "./context";
import { Types } from "./types";

type TDoAddNode = ThunkModuleToFunc<typeof DoAddNode>;
type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
};

export default (props: Props) => {
  const { addNodeLocally } = props;

  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance: selectedPlugin, pluginInstances } = pluginInstance;

  const [classPlugin, doPlugin] = useThunk<DoPlugin.State, TDoPlugin>(DoPlugin);
  const pluginID = getDefaultID(classPlugin);
  const plugin = getState(classPlugin) || DoPlugin.defaultState;
  const { nodeOperations, parameters: params } = plugin;
  const { childNode } = nodeOperations;

  const [classAddNode, doAddNode] = useThunk<DoAddNode.State, TDoAddNode>(
    DoAddNode,
  );
  const addNodeID = getDefaultID(classAddNode);
  const addNode = getState(classAddNode) || DoAddNode.defaultState;

  const {
    pluginMeta,
    selectedPluginFromMeta,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
  } = addNode;

  const isDisabled =
    params && Object.keys(requiredInput).length !== params.required.length;

  const toggleOpen = () => {
    doAddNode.reset(addNodeID);
    doPlugin.getNodeOperations(pluginID, "childNode");
  };

  const onError = (error: Record<string, string>) => {
    doAddNode.setError(addNodeID, error);
  };

  const onSave = () => {
    doPluginInstance.createPluginInstance(
      pluginInstnaceID,
      selectedPlugin,
      addNode,
    );
  };
  useCallback(async () => {
    if (!selectedPluginFromMeta || !selectedPlugin || !pluginInstances) return;

    const { advancedConfigErrors, sanitizedInput } = sanitizeAdvancedConfig(
      advancedConfig,
      memoryLimit,
    );

    if (Object.keys(advancedConfigErrors).length > 0) {
      onError(advancedConfigErrors);
      return;
    }

    const parameterInput = await getParameterInput(
      dropdownInput,
      requiredInput,
      selectedPluginFromMeta,
      selectedComputeEnv,
      sanitizedInput,
      selectedPlugin,
    );

    const {
      status,
      data: instance,
      errmsg,
    } = await createPluginInstance(selectedPluginFromMeta.id, {
      previous_id: selectedPlugin.id,
      ...parameterInput,
    });
    if (!instance) {
      nodeDispatch({ type: Types.SetError, payload: { error: errmsg } });
      return;
    }

    addNodeLocally(instance);
    toggleOpen();
  }, [
    selectedPluginFromMeta,
    selectedPlugin,
    pluginInstances,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
    onError,
    toggleOpen,
    nodeDispatch,
    addNodeLocally,
  ]);

  return (
    <Modal
      aria-label="Wizard Modal"
      showClose
      hasNoBodyWrapper
      variant={ModalVariant.large}
      isOpen={childNode}
    >
      <Wizard
        header={
          <WizardHeader
            onClose={toggleOpen}
            title="Add a New Node"
            description="This wizard allows you to add a node to a feed"
          />
        }
        onClose={toggleOpen}
        onSave={onSave}
        height={500}
        width="100%"
      >
        <WizardStep
          id="1"
          name="Plugin Selection"
          footer={{ isNextDisabled: !pluginMeta }}
        >
          {selectedPlugin ? (
            <BasicConfiguration selectedPlugin={selectedPlugin} />
          ) : (
            <Alert
              type="error"
              description="Please select a plugin to add this node to"
            />
          )}
        </WizardStep>
        <WizardStep
          id="2"
          name="Plugin Form"
          footer={{ nextButtonText: "Add Node", isNextDisabled: isDisabled }}
        >
          <GuidedConfig />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};
