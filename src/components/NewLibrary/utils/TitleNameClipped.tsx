import { Tooltip } from "@patternfly/react-core";
import elipses from "./elipses";

type Props = {
  name: string;
  value: number;
};
export default (props: Props) => {
  const { name, value } = props;
  const clippedName = elipses(name, value);

  return (
    <Tooltip content={name}>
      <span>{clippedName}</span>
    </Tooltip>
  );
};
