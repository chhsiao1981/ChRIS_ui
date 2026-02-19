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
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { createPluginInstance } from "../../api/serverApi";
import type { PluginInstance } from "../../api/types";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import { AddNodeContext } from "./context";
import { Types } from "./types";

type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
};

export default (props: Props) => {
  const { addNodeLocally } = props;

  const [classStatePluginInstance, _1] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstance =
    getState(classStatePluginInstance) || DoPluginInstance.defaultState;
  const { selectedPlugin, pluginInstances } = pluginInstance;

  const [classStatePlugin, doPlugin] = useThunk<DoPlugin.State, TDoPlugin>(
    DoPlugin,
  );
  const pluginID = getRootID(classStatePlugin);
  const plugin = getState(classStatePlugin) || DoPlugin.defaultState;
  const { nodeOperations, parameters: params } = plugin;
  const { childNode } = nodeOperations;

  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);

  const {
    pluginMeta,
    selectedPluginFromMeta,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
  } = state;

  const isDisabled =
    params && Object.keys(requiredInput).length !== params.required.length;

  const toggleOpen = () => {
    nodeDispatch({ type: Types.ResetState, payload: {} });
    doPlugin.getNodeOperations(pluginID, "childNode");
  };

  const errorCallback = (error: any) => {
    nodeDispatch({ type: Types.SetError, payload: { error } });
  };

  const handleSave = useCallback(async () => {
    if (!selectedPluginFromMeta || !selectedPlugin || !pluginInstances) return;

    const { advancedConfigErrors, sanitizedInput } = sanitizeAdvancedConfig(
      advancedConfig,
      memoryLimit,
    );

    if (Object.keys(advancedConfigErrors).length > 0) {
      errorCallback(advancedConfigErrors);
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
    errorCallback,
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
        onSave={handleSave}
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
