/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */

import type { IPluginState } from "../plugin/pluginSlice";
import type { IPluginInstanceState } from "../pluginInstance/types";

export interface ApplicationState {
  plugin: IPluginState;
  instance: IPluginInstanceState;
}

export type RootState = ApplicationState;
