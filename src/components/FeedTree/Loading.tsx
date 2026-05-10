import {
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import type { CSSProperties } from "react";
import * as DoPluginInstance from "../../reducers/pluginInstance";
import styles from "./Loading.module.css";

type TDoPluginInstance = ThunkModuleToFunc<typeof DoPluginInstance>;

export default () => {
  const [classPluginInstance, _doPluginInstance] = useThunk<
    DoPluginInstance.State,
    TDoPluginInstance
  >(DoPluginInstance);

  const pluginInstance =
    getState(classPluginInstance) || DoPluginInstance.defaultState;

  const { isLoading, processingProgress } = pluginInstance;

  const rootStyle = isLoading ? styles.root : styles.hide;

  const barStyle: CSSProperties = {
    width: `${processingProgress}%`,
  };
  return (
    <div className={rootStyle}>
      <div>
        <div className={styles.head}>
          Processing Tree: {processingProgress}%
        </div>
        <div className={styles.fullbar}>
          <div className={styles.bar} style={barStyle} />
        </div>
      </div>
    </div>
  );
};
