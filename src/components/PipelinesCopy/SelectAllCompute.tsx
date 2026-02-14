import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useLocation } from "react-router";
import { getComputeResources } from "../../api/serverApi/computeResource";
import type { Pipeline } from "../../api/types";
import { Avatar } from "../Antd";
import { stringToColour } from "../CreateFeed/utils";
import { PipelineContext, Types } from "./context";

type Props = {
  pipeline: Pipeline;
};

export default (props: Props) => {
  const { pipeline } = props;
  const location = useLocation();
  const { id } = pipeline;
  const { state, dispatch } = useContext(PipelineContext);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedItem = state.generalCompute?.[id] || "";

  const fetchCompute = async () => {
    const { status, data, errmsg } = await getComputeResources({
      limit: 100,
      offset: 0,
    });
    const computeResources = data || [];
    return computeResources;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["computeResource"],
    queryFn: () => fetchCompute(),
  });

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    event?.stopPropagation();

    if (value === "none") {
      dispatch({
        type: Types.SetAllCompute,
        payload: {
          pipelineId: id,
          compute: "",
        },
      });
    } else
      dispatch({
        type: Types.SetAllCompute,
        payload: {
          pipelineId: id,
          compute: value as string,
        },
      });
  };

  const onToggleClick = (e: any) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  const browseOnly = location.pathname === "/pipelines";
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {browseOnly
        ? "List of Compute"
        : selectedItem
          ? selectedItem
          : "Set a Compute for the Tree"}
    </MenuToggle>
  );

  return (
    <Select
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      selected={data || []}
      onSelect={onSelect}
      isOpen={isOpen}
      toggle={toggle}
    >
      <SelectList>
        {data && !isLoading && !isError ? (
          data.map((resource) => {
            return (
              <SelectOption
                isSelected={resource.name === selectedItem}
                value={resource.name}
                key={resource.name}
              >
                <Avatar
                  style={{
                    background: `${stringToColour(resource.name)}`,
                    marginRight: "0.5em",
                  }}
                />
                <span>{resource.name}</span>
              </SelectOption>
            );
          })
        ) : (
          <SelectOption>No Compute Registered</SelectOption>
        )}
        {isLoading && <span>Fetching compute...</span>}
        {isError && <span>{error.message}</span>}
        <SelectOption isSelected={!selectedItem} value="none">
          None Selected
        </SelectOption>
      </SelectList>
    </Select>
  );
};
