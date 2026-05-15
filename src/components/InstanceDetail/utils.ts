import { CheckIcon } from "@patternfly/react-icons";
import ClockIcon from "@patternfly/react-icons/dist/esm/icons/clock-icon";
import InProgress from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";
import TimesCircleIcon from "@patternfly/react-icons/dist/esm/icons/times-circle-icon";
import { customQuote, needsQuoting } from "../../api/common";
import type {
  Plugin,
  PluginInstance,
  PluginInstanceParameter,
  PluginParameter,
} from "../../api/types";

/** Constants that help unify “finished” and “error” states. */
export const ERROR_STATUSES = ["finishedWithError", "cancelled"] as const;
export const FINISHED_STATUSES = [
  ...ERROR_STATUSES,
  "finishedSuccessfully",
] as const;

type ErrorStatus = (typeof ERROR_STATUSES)[number]; // "finishedWithError" | "cancelled"
type FinishedStatus = (typeof FINISHED_STATUSES)[number]; // "finishedWithError" | "cancelled" | "finishedSuccessfully"

/**
 * Hard-coded map of error codes to simplified messages (unchanged).
 */
export const getErrorCodeMessage = (errorCode: string) => {
  const errorCodeMap: Record<string, string> = {
    CODE01: "Error submitting job to pfcon url",
    CODE02: "Error getting job status at pfcon",
    CODE03: "Error fetching zip from pfcon url",
    CODE04: "Received bad zip file from remote",
    CODE05:
      "Couldn't find any plugin instance with correct ID while processing input instances to ts plugin instance",
    CODE06: "Error while listing swift storage files",
    CODE07: "Error while uploading file to swift storage",
    CODE08: "Error while downloading file from swift storage",
    CODE09: "Error while copying file in swift storage",
    CODE10: "Got undefined status from remote",
    CODE11:
      "Error while listing swift storage files; presumable eventual consistency problem",
    CODE12: "Error deleting job from pfcon",
  };

  const errorMessage = errorCodeMap[errorCode];
  return errorMessage
    ? `ChRIS Internal Error: ${errorMessage}`
    : "ChRIS Internal Error";
};

/**
 * Gets a “start state” for an in-progress plugin.
 */
const getStartState = (pluginStatus: string): string => {
  return pluginStatus === "scheduled" || pluginStatus === "started"
    ? pluginStatus
    : "started";
};

/**
 * Gets the “end state” if it's one of the FINISHED_STATUSES; otherwise “Waiting To Finish”.
 */
const getEndState = (pluginStatus: string): string => {
  return FINISHED_STATUSES.includes(pluginStatus as FinishedStatus)
    ? pluginStatus
    : "Waiting To Finish";
};

/**
 * Helper to see if we are 'waiting' or not.
 */
const getWaitingStatus = (
  instance: PluginInstance,
  currentLabel: number,
  previousStatus: string,
): boolean => {
  // If it's an 'fs' plugin, wait after index 0.
  // Otherwise only wait if the previous plugin ended successfully.
  return instance.plugin_type === "fs"
    ? currentLabel > 0
    : currentLabel > 0 && previousStatus === "finishedSuccessfully";
};

/** Define what each portion of the `labels` might look like. */
interface StatusObject {
  status?: boolean; // e.g. true if step is done
  job_status?: string; // e.g. "finishedSuccessfully", "cancelled", ...
}

interface StrictPluginStatusLabels {
  pushPath?: StatusObject;
  pullPath?: StatusObject;
  swiftPut?: StatusObject;

  compute?: {
    submit?: StatusObject;
    return?: StatusObject;
  };

  error?: boolean; // e.g. if there's some global error
  currentStep?: string; // e.g. "transmit", "compute"
  title?: string; // e.g. for display
}

/** If not all properties are guaranteed, we can keep them partial. */
export type PluginStatusLabels = Partial<StrictPluginStatusLabels>;

/** Simple function to show an overall textual description (optional). */
export const displayDescription = (label: PluginStatusLabels) => {
  if (label.error) {
    return "Error in compute";
  }
  if (label.currentStep) {
    return label.title || "";
  }
  return "";
};

/**
 * Helper to decide which icon to render for a step,
 * based on error/finish/process booleans.
 */
const getStepIcon = (args: {
  error: boolean;
  finish: boolean;
  process: boolean;
}) => {
  const { error, finish, process } = args;

  if (error) return TimesCircleIcon; // error icon
  if (finish) return CheckIcon; // success icon
  if (process) return InProgress; // spinner icon
  return ClockIcon; // idle/waiting icon
};

/**
 * Returns an array of step descriptors that represent the progress states
 * for a single plugin, including a final step (index 6) to handle
 * “cancelled” or “finishedWithError”.
 */
export const getStatusLabels = (
  labels: PluginStatusLabels,
  pluginDetails: PluginInstance,
  previousStatus: string,
) => {
  // Each item represents how we want to display that step in the UI.
  type StatusItem = {
    description: string;
    process: boolean; // if we should show the spinner
    wait: boolean; // if step is waiting for something prior
    finish: boolean; // if step is fully done
    error: boolean; // if step encountered an error
    icon: React.ComponentType<any>;
  };

  const status: StatusItem[] = [];

  const pluginStatus = pluginDetails.status;
  const startState = getStartState(pluginStatus);
  const endState = getEndState(pluginStatus);

  // The distinct steps in the plugin's lifecycle:
  const steps = [
    "waiting", // index 0
    startState, // 1
    "transmit", // 2
    "compute", // 3
    "syncData", // 4
    "registeringFiles", // 5
    endState, // 6 (could be "finishedSuccessfully", "cancelled", or "finishedWithError")
  ];

  // figure out which step index the plugin is currently on
  const currentLabel = steps.indexOf(pluginStatus);
  const waitingStatus = getWaitingStatus(
    pluginDetails,
    currentLabel,
    previousStatus,
  );

  // A small helper to see if the overall plugin is in an error status
  const pluginIsInError = ERROR_STATUSES.includes(pluginStatus as ErrorStatus);

  // STEP 0
  {
    const stepIndex = 0;
    const stepReached = currentLabel >= stepIndex || pluginStatus === "waiting";

    const stepError =
      // Mark step as error if the plugin is in error
      // and the plugin reached or is at this step.
      pluginIsInError && stepReached;

    const stepFinish =
      // We consider "waiting" step "finished" if we are already
      // past 'waiting' or we've started or ended the plugin
      !stepError && waitingStatus;

    const stepProcess =
      // Show spinner if we are actively "waiting" in the plugin
      pluginStatus === "waiting";

    status[0] = {
      description: "Waiting",
      process: stepProcess,
      wait: false,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 1: Started
  {
    const stepIndex = 1;
    const stepReached = currentLabel >= stepIndex;

    const stepError = pluginIsInError && stepReached;
    const stepFinish =
      !stepError && (labels?.pushPath?.status === true || currentLabel === 6);

    const stepProcess =
      ["scheduled", "created", "started"].includes(pluginStatus) && !labels; // or your own condition

    status[1] = {
      description: "Started",
      process: stepProcess,
      wait: !waitingStatus,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 2: Transmitting
  {
    const stepIndex = 2;
    const stepReached = currentLabel >= stepIndex;
    const stepError =
      pluginIsInError &&
      stepReached &&
      // If we wanted to ensure that the error specifically
      // happens after we attempt the “transmit”:
      // currentLabel === stepIndex || (some condition)...

      // simpler approach:
      pluginIsInError;

    const stepFinish = !stepError && labels?.pushPath?.status === true;

    const stepProcess =
      pluginStatus === "started" &&
      !stepFinish && // if pushPath isn't done
      stepReached;

    status[2] = {
      description: "Transmitting",
      process: stepProcess,
      wait: !status[1].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 3: Computing
  {
    const stepIndex = 3;
    const stepReached = currentLabel >= stepIndex;

    // e.g. the plugin job might have been cancelled in the middle of compute
    const computeJobStatus = labels?.compute?.return?.job_status;
    const stepError =
      (pluginIsInError && stepReached) ||
      ERROR_STATUSES.includes((computeJobStatus ?? "") as ErrorStatus);

    const stepFinish = Boolean(
      !stepError &&
        labels?.compute?.return?.status &&
        labels?.compute?.submit?.status &&
        FINISHED_STATUSES.includes((computeJobStatus ?? "") as FinishedStatus),
    );

    const stepProcess =
      !stepError &&
      !stepFinish &&
      stepReached &&
      status[2].finish &&
      !!labels?.compute?.submit?.status &&
      !labels?.compute?.return?.status;

    status[3] = {
      description: "Computing",
      process: stepProcess,
      wait: !status[2].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 4: syncData / "Receiving"
  {
    const stepIndex = 4;
    const stepReached = currentLabel >= stepIndex;
    const stepError =
      pluginIsInError &&
      stepReached &&
      // If you specifically want “cancelled while receiving” to show here:
      currentLabel >= stepIndex;

    const stepFinish = !stepError && !!labels?.pullPath?.status;

    const stepProcess =
      !stepError && stepReached && status[3].finish && !stepFinish;

    status[4] = {
      description: "Receiving",
      process: stepProcess,
      wait: !status[3].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 5: registeringFiles
  {
    const stepIndex = 5;
    const stepReached = currentLabel >= stepIndex;
    const stepError = pluginIsInError && stepReached;

    const stepFinish =
      !stepError &&
      status[4].finish &&
      FINISHED_STATUSES.includes(pluginStatus as FinishedStatus);

    const stepProcess =
      !stepError &&
      pluginStatus === "registeringFiles" &&
      stepReached &&
      status[4].finish;

    status[5] = {
      description: "Registering Files",
      process: stepProcess,
      wait: !status[4].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 6: final (finishedSuccessfully, cancelled, or finishedWithError)
  {
    const stepIndex = 6;
    const stepReached = currentLabel >= stepIndex;
    const stepError = pluginIsInError && stepReached;

    const isReallyFinished = FINISHED_STATUSES.includes(
      pluginStatus as FinishedStatus,
    );

    const stepFinish = isReallyFinished && !stepError;
    const stepProcess = false; // never show spinner if we’re in a final state

    status[6] = {
      description:
        pluginStatus === "finishedSuccessfully"
          ? "Finished Successfully"
          : pluginStatus === "cancelled"
            ? "Cancelled"
            : pluginStatus === "finishedWithError"
              ? "Finished With Error"
              : "Waiting To Finish",
      process: stepProcess,
      wait: false,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  return status;
};

export const getCommand = (
  plugin: Plugin,
  params: PluginInstanceParameter[],
  parameters: PluginParameter[],
) => {
  const { dock_image, selfexec } = plugin;
  const modifiedParams: {
    name?: string;
    value?: string;
  }[] = [];

  const instanceParameters = params;
  const pluginParameters = parameters;

  // Create a lookup map for plugin parameters to avoid O(n²) nested loop
  const pluginParamsMap = new Map();
  for (const pluginParam of pluginParameters) {
    pluginParamsMap.set(pluginParam.name, pluginParam);
  }

  // Single pass through instance parameters - O(n) complexity
  for (const instanceParam of instanceParameters) {
    const pluginParam = pluginParamsMap.get(instanceParam.param_name);

    if (pluginParam) {
      const isBoolean = instanceParam.type === "boolean";
      const isString = instanceParam.type === "string";
      const value = instanceParam.value;
      const paramName = instanceParam.param_name;

      // Check if parameter name contains "password" (case insensitive)
      const isPassword =
        paramName.toLowerCase().includes("password") ||
        pluginParam.data.flag?.toLowerCase().includes("password");

      // If it's a password, mask the value with asterisks of the same length
      const displayValue = isPassword
        ? "*".repeat(value ? value.length : 0)
        : value;

      // For password fields, ensure the masked value is used consistently
      const safeValue = isPassword
        ? displayValue
        : isString && needsQuoting(displayValue)
          ? customQuote(displayValue)
          : displayValue;

      modifiedParams.push({
        name: pluginParam.data.flag,
        value: isBoolean ? " " : safeValue,
      });
    }
  }

  let command = `$> apptainer exec --bind $PWD/in:/incoming,$PWD/out:/outgoing docker://${dock_image} ${selfexec} `;
  let parameterCommand = [];

  if (modifiedParams.length) {
    parameterCommand = modifiedParams.map(
      (param) => `${param.name} ${param.value}`,
    );
    if (parameterCommand.length > 0) {
      command += `${parameterCommand.join(" ")} \\\n`;
    }
  }
  command = `${command}/incoming /outgoing \n \n`;

  return command;
};

export const getExecTime = (selected?: PluginInstance) => {
  if (!selected) {
    return "";
  }

  let runtime = 0;
  const start = new Date(selected.start_date);
  const end = new Date(selected.end_date);
  const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
  runtime += elapsed;

  // format millisecond amount into human-readable string
  const runtimeStrings = [];
  const timeParts = [
    ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
    ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
    ["min", Math.floor((runtime / 1000 / 60) % 60)],
    ["sec", Math.floor((runtime / 1000) % 60)],
  ];
  for (const part of timeParts) {
    const [name, value] = part;
    if (+value > 0) {
      runtimeStrings.push(`${value} ${name}`);
    }
  }
  return runtimeStrings.join(", ");
};
