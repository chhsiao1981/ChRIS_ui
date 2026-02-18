import type { ComputeResource } from "../../api/types";
import { Avatar, Checkbox, List } from "../Antd";
import { stringToColour } from "../CreateFeed/utils";

type Props = {
  computeResources: ComputeResource[];
  currentlyActive?: string;
  showCheckbox?: boolean;
  handleComputeChange?: (compute: string) => void;
};

export default (props: Props) => {
  const {
    computeResources,
    currentlyActive,
    showCheckbox,
    handleComputeChange,
  } = props;
  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={computeResources}
        renderItem={(item: ComputeResource, index: number) => {
          return (
            <List.Item
              style={{ paddingTop: showCheckbox && index === 0 ? 0 : "" }}
            >
              <List.Item.Meta
                avatar={
                  <>
                    {showCheckbox && (
                      <Checkbox
                        style={{
                          marginRight: "0.5em",
                        }}
                        onClick={() => {
                          handleComputeChange?.(item.name);
                        }}
                        checked={currentlyActive === item.name}
                      />
                    )}

                    <Avatar
                      style={{
                        background: `${stringToColour(item.name)}`,
                      }}
                    />
                  </>
                }
                title={item.name}
                description={item.description}
              />
            </List.Item>
          );
        }}
      />
    </>
  );
};
