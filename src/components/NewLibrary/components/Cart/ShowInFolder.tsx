import { Button, Tooltip } from "@patternfly/react-core";
import { FolderIcon } from "@patternfly/react-icons";
import type { MouseEventHandler } from "react";

type Props = {
  isError: boolean;
  prompt: string;
  onClick: MouseEventHandler;
};
export default (props: Props) => {
  const { isError, onClick, prompt } = props;

  return (
    <Tooltip content={prompt}>
      <Button
        isDisabled={isError}
        onClick={onClick}
        variant="link"
        icon={<FolderIcon />}
      />
    </Tooltip>
  );
};
