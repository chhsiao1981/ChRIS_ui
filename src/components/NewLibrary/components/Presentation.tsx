import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  GridItem,
  Split,
  SplitItem,
  Tooltip,
} from "@patternfly/react-core";
import { format } from "date-fns";
import { isEmpty } from "lodash";
import type { FormEvent, MouseEvent, ReactElement } from "react";

import type { OriginState } from "../context";
import elipses from "../utils/elipses";

import FolderContextMenu from "./FolderContextMenu";

type Props = {
  name: string;
  computedPath: string;
  date: string;
  origin: OriginState;
  onClick?: (e: MouseEvent<HTMLElement, globalThis.MouseEvent>) => void;
  onMouseDown?: () => void;
  onCheckboxChange?: (e: FormEvent<HTMLInputElement>) => void;
  onContextMenuClick?: (
    e: MouseEvent<HTMLElement, globalThis.MouseEvent>,
  ) => void;
  onNavigate: () => void;
  isChecked?: boolean;
  icon: ReactElement;
  bgRow?: string;

  username: string;
};

export default (props: Props) => {
  const {
    name,
    origin,
    computedPath,
    date,
    onClick,
    onNavigate,
    onMouseDown,
    onCheckboxChange,
    onContextMenuClick,
    isChecked,
    icon,
    bgRow,

    username,
  } = props;

  return (
    <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
      <FolderContextMenu
        username={username}
        origin={origin}
        computedPath={computedPath}
      >
        <Card
          style={{ cursor: "pointer", background: bgRow || "inherit" }}
          isCompact
          isSelectable
          isClickable
          isFlat
          isRounded
          onClick={onClick}
          onMouseDown={onMouseDown}
          onContextMenu={onContextMenuClick}
        >
          <CardHeader
            actions={{
              actions: (
                <Checkbox
                  className="large-checkbox"
                  isChecked={isChecked}
                  id={name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={onCheckboxChange}
                />
              ),
            }}
          >
            <Split>
              <SplitItem style={{ marginRight: "1em" }}>{icon}</SplitItem>
              <SplitItem>
                <Tooltip content={name}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate();
                    }}
                    variant="link"
                    style={{ padding: 0 }}
                  >
                    {elipses(name, 40)}
                  </Button>
                </Tooltip>

                <div
                  style={{
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    {!isEmpty(date)
                      ? format(new Date(date), "dd MMM yyyy, HH:mm")
                      : "N/A"}
                  </div>
                </div>
              </SplitItem>
            </Split>
          </CardHeader>
        </Card>
      </FolderContextMenu>
    </GridItem>
  );
};
