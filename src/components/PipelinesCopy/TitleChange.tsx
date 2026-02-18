import { Button, TextInput } from "@patternfly/react-core";
import { useContext, useEffect, useState } from "react";
import type { Pipeline, Piping } from "../../api/types";
import { Alert, Form, Space } from "../Antd";
import { PipelineContext, Types } from "./context";

type Props = {
  currentPipeline: Pipeline;
};

export default (props: Props) => {
  const { currentPipeline } = props;
  const { state, dispatch } = useContext(PipelineContext);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const { currentlyActiveNode, titleInfo, selectedPipeline } = state;
  const { id } = currentPipeline;

  const activeNode = currentlyActiveNode?.[id];
  const pluginPipings = selectedPipeline?.[id].pluginPipings;
  const userEnteredTitle = titleInfo?.[id];

  useEffect(() => {
    // Fetch title when the component mounts
    fetchTitle(activeNode, pluginPipings);
  }, [activeNode, pluginPipings]); // Add dependencies based on when you want to refetch the title

  function fetchTitle(activeNode?: string, pluginPipings?: Piping[]) {
    try {
      if (pluginPipings && activeNode) {
        if (userEnteredTitle) {
          const title = userEnteredTitle[activeNode];
          setValue(title);
        }
        const currentPiping = pluginPipings.find(
          (piping) => piping.id === activeNode,
        );
        setValue(currentPiping?.title || ""); // Ensure a default value
      }
    } catch (error) {
      throw new Error("Failed to fetch title");
    }
  }

  const handleSaveTitle = () => {
    try {
      dispatch({
        type: Types.SetChangeTitle,
        payload: {
          pipelineId: id,
          nodeId: activeNode,
          title: value,
        },
      });
    } catch (error) {
      // Handle the error, e.g., show an alert to the user
      setError(error as string);
    }
  };

  return (
    <>
      <Form layout="vertical">
        <Form.Item label="Set a Title for the selected node">
          <Space.Compact>
            <TextInput
              onChange={(_e, value) => setValue(value)}
              value={value}
            />
            <Button size="sm" variant="primary" onClick={handleSaveTitle}>
              Save Title
            </Button>
          </Space.Compact>
        </Form.Item>
      </Form>

      {error && <Alert closable type="error" description={error} />}
    </>
  );
};
