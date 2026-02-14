import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getPluginComputeResources,
  getPluginParameters,
} from "../../api/serverApi/plugin";
import type { Plugin, PluginParameter } from "../../api/types";

// Define the initial state
export interface IPluginState {
  parameters: {
    required: PluginParameter[];
    dropdown: PluginParameter[];
  };
  computeEnv?: any[];
  resourceError: string;
  nodeOperations: {
    [key: string]: boolean;
  };
}

const initialState: IPluginState = {
  parameters: {
    dropdown: [],
    required: [],
  },
  computeEnv: undefined,
  resourceError: "",
  nodeOperations: {
    terminal: false,
    childNode: false,
    childPipeline: false,
    childGraph: false,
    deleteNode: false,
  },
};

// Create async thunk to replace the saga
export const fetchParamsAndComputeEnv = createAsyncThunk(
  "plugin/fetchParamsAndComputeEnv",
  async (plugin: Plugin, { rejectWithValue }) => {
    try {
      const limit = 20;
      const offset = 0;
      const { status, data, errmsg } = await getPluginParameters(
        plugin.id,
        offset,
        limit,
      );
      const params = data || [];

      const limit2 = 20;
      const offset2 = 0;
      const {
        status: status2,
        data: data2,
        errmsg: errmsg2,
      } = await getPluginComputeResources(plugin.id, offset2, limit2);
      const computeEnvs = data2 || [];

      const required = params.filter(
        (param: PluginParameter) => param.optional === false,
      );
      const dropdown = params.filter(
        (param: PluginParameter) => param.optional === true,
      );

      return { required, dropdown, computeEnvs };
    } catch (error: any) {
      let errorMessage =
        "Unhandled error. Please reach out to @devbabymri.org to report this error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  },
);

const pluginSlice = createSlice({
  name: "plugin",
  initialState,
  reducers: {
    getNodeOperations(state, action: PayloadAction<string>) {
      const key = action.payload;
      if (key in state.nodeOperations) {
        state.nodeOperations[key] = !state.nodeOperations[key];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParamsAndComputeEnv.fulfilled, (state, action) => {
        state.parameters.required = action.payload.required;
        state.parameters.dropdown = action.payload.dropdown;
        state.computeEnv = action.payload.computeEnvs;
      })
      .addCase(fetchParamsAndComputeEnv.rejected, (state, action) => {
        state.resourceError = action.payload as string;
      });
  },
});

// Export the actions
export const { getNodeOperations } = pluginSlice.actions;

// Export the reducer
export default pluginSlice.reducer;
