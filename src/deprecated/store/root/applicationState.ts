/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */

import type { IPluginInstanceState } from "../pluginInstance/types";

export interface ApplicationState {
  instance: IPluginInstanceState;
}

export type RootState = ApplicationState;
