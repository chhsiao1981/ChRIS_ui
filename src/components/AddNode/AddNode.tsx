import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import { useCallback } from "react";
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
import * as DoAddNode from "../../reducers/addNode";
import * as DoPlugin from "../../reducers/plugin";
import * as DoPluginInstance from "../../reducers/pluginInstance";

type TDoAddNode = ThunkModuleToFunc<typeof DoAddNode>;
type TDoPlugin = ThunkModuleToFunc<typeof DoPlugin>;
type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

type Props = {
  isOpen: boolean;
  close: () => void;
};

export default (props: Props) => {
  const { isOpen, close } = props;
  const [classPluginInstance, doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstanceID = getDefaultID(classPluginInstance);
  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;
  const { selectedInstance, instanceList: pluginInstances } = pluginInstance;

  const [classPlugin, _doPlugin] = useThunk<DoPlugin.State, TDoPlugin>(
    DoPlugin,
  );
  const plugin = getState(classPlugin) || DoPlugin.defaultState;
  const { parameters: params } = plugin;

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

  const onClose = () => {
    doAddNode.reset(addNodeID);
    close();
  };

  const onError = (error: Record<string, string>) => {
    doAddNode.setError(addNodeID, error);
  };

  const onSave = () => {
    if (!selectedInstance) {
      return;
    }
    doPluginInstance.createInstance(
      pluginInstanceID,
      selectedInstance,
      addNode,
    );
  };

  useCallback(async () => {
    if (!selectedPluginFromMeta || !selectedInstance || !pluginInstances)
      return;

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
      selectedInstance,
    );

    const {
      status,
      data: instance,
      errmsg,
    } = await createPluginInstance(selectedPluginFromMeta.id, {
      previous_id: selectedInstance.id,
      ...parameterInput,
    });
    if (!instance) {
      //nodeDispatch({ type: Types.SetError, payload: { error: errmsg } });
      return;
    }

    //addNodeLocally(instance);
    onClose();
  }, [
    selectedPluginFromMeta,
    selectedInstance,
    pluginInstances,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
    onError,
    onClose,
  ]);

  return (
    <Modal
      aria-label="Wizard Modal"
      showClose
      hasNoBodyWrapper
      variant={ModalVariant.large}
      isOpen={isOpen}
    >
      <Wizard
        header={
          <WizardHeader
            onClose={onClose}
            title="Add a New Node"
            description="This wizard allows you to add a node to a feed"
          />
        }
        onClose={onClose}
        onSave={onSave}
        height={500}
        width="100%"
      >
        <WizardStep
          id="1"
          name="Plugin Selection"
          footer={{ isNextDisabled: !pluginMeta }}
        >
          {selectedInstance ? (
            <BasicConfiguration selectedPlugin={selectedInstance} />
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
