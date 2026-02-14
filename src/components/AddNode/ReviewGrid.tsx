import type { Plugin } from "../../api/types";
import { RenderFlexItem } from "../Common";

type Props = {
  generatedCommand: string;
  selectedPlugin?: Plugin;
  computeEnvironment: string;
};

export const PluginDetails = (props: Props) => {
  const { generatedCommand, selectedPlugin, computeEnvironment } = props;
  if (!selectedPlugin) {
    return <div>Something went wrong. Could you please try this again?</div>;
  }

  const { version, title, name, type } = selectedPlugin;
  const pluginName = title ? title : `${name} v.${version}`;

  return (
    <>
      <RenderFlexItem
        title={<span className="review__title">Selected Plugin:</span>}
        subTitle={<span className="review__value">{pluginName || "N/A"}</span>}
      />

      <RenderFlexItem
        title={<span className="review__title">Type of Plugin:</span>}
        subTitle={
          <span className="review__value">{type?.toUpperCase() || "N/A"}</span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Plugin Configuration:</span>}
        subTitle={
          <span className="required-text">{generatedCommand || "N/A"}</span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Compute Environment:</span>}
        subTitle={
          <span className="review__value">{computeEnvironment || "N/A"}</span>
        }
      />
    </>
  );
};
