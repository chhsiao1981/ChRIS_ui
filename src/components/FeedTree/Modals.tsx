import type { Feed, PluginInstance } from "../../api/types";
import AddNode from "../AddNode/AddNode";
import AddPipeline from "../AddPipeline/AddPipeline";
import DeleteNode from "../DeleteNode";

type Props = {
  addNodeLocally: (inst: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;
  feed?: Feed;
  isStaff: boolean;
};

export default (props: Props) => {
  const { addNodeLocally, removeNodeLocally, feed, isStaff } = props;
  return (
    <>
      <AddNode addNodeLocally={addNodeLocally} />
      <DeleteNode removeNodeLocally={removeNodeLocally} feed={feed} />
      <AddPipeline addNodeLocally={addNodeLocally} isStaff={isStaff} />
    </>
  );
};
