import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Pagination,
  TextInput,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { useContext, useState } from "react";
import { fetchResources } from "../../api/common";
import { Alert, Collapse } from "../Antd";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import "./Pipelines.css";
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { DownloadIcon } from "@patternfly/react-icons";
import { error } from "console";
import { isError } from "util";
import type { ID } from "../../api/types";
import * as DoPipeline from "../../reducers/pipeline";
import { usePaginate } from "../hooks/usePaginate";
import { PIPELINEQueryTypes, Types } from "./context";
import PipelinesComponent from "./PipelinesComponent";
import PipelineUpload from "./PipelineUpload";
import { useDownloadSource } from "./useDownloadSource";

type TDoPipeline = ThunkModuleToFunc<typeof DoPipeline>;

type LoadingResources = {
  [key: string]: boolean;
};
type LoadingResourceError = {
  [key: string]: string;
};

type Props = {
  isStaff: boolean;
  usePipeline: UseThunk<DoPipeline.State, TDoPipeline>;
};

export default (props: Props) => {
  const { isStaff, usePipeline } = props;

  const [classStatePipeline, doPipeline] = usePipeline;
  const statePipelineID = getRootID(classStatePipeline);
  const pipeline = getState(classStatePipeline) || DoPipeline.defaultState;
  const { pipelineToAdd, pipelineInfoMap: pipelineMap } = pipeline;

  const { isDarkTheme } = useContext(ThemeContext);
  const [loadingResources, setLoadingResources] = useState<LoadingResources>();
  const [resourceError, setResourceError] = useState<LoadingResourceError>();
  const { pageState, setPage, setPerPage, setSearch } = usePaginate();
  const { perPage, page, search } = pageState;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string>(
    PIPELINEQueryTypes.NAME[0],
  );

  const activeKeys = pipelineToAdd ? [pipelineToAdd.id] : [];

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onFetchPipelines = () => {
    doPipeline.fetchPipelines(statePipelineID, page, perPage, search);
  };

  const onSelectPipeline = (pipelineID: ID, isSelected: boolean) => {
    if (isSelected) {
      // If the pipeline is already selected, deselect it
      doPipeline.pipelineToAdd(statePipelineID, undefined);
      // Collapse the accordion panel
      return;
    }

    // Find the pipeline and select it
    const pipeline = pipelineMap[pipelineID];
    if (!pipeline) {
      return;
    }

    doPipeline.pipelineToAdd(statePipelineID, pipeline.pipeline);
  };

  const onChange = (key: string | string[]) => {
    // Update activeKeys to control which accordion panels are open
    const selectedKeys = Array.isArray(key) ? key : [key];

    if (selectedKeys.length === 0) {
      doPipeline.pipelineToAdd(statePipelineID, undefined);
      return;
    }

    // There should only be one selected item in the accordion
    const pipelineID = Number.parseInt(selectedKeys[0]);
    const isSelected = pipelineToAdd?.id === pipelineID;
    onSelectPipeline(pipelineID, isSelected);
  };

  const dropdownItems = [
    Object.values(PIPELINEQueryTypes).map((pipeline) => {
      return (
        <DropdownItem
          key={pipeline[0]}
          description={pipeline[1]}
          component="button"
          onClick={() => updateDropdownValue(pipeline[0])}
        >
          {pipeline[0]}
        </DropdownItem>
      );
    }),
  ];

  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const handlePipelineSearch = (search: string) => {
    setSearch(search, dropdownValue);
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    handlePipelineSearch("");
  };

  const downloadPipelineMutation = useDownloadSource();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Dropdown
            onSelect={onSelect}
            toggle={(toggleRef) => {
              return (
                <MenuToggle ref={toggleRef} onClick={onToggle}>
                  {dropdownValue}
                </MenuToggle>
              );
            }}
            isOpen={isDropdownOpen}
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
          <TextInput
            value={pageState.search}
            type="text"
            placeholder={dropdownValue}
            customIcon={<SearchIcon />}
            aria-label="search"
            onChange={(_event, value: string) => {
              handlePipelineSearch(value);
            }}
          />
        </div>

        <Pagination
          itemCount={data?.totalCount ? data.totalCount : 0}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={setPage}
          onPerPageSelect={setPerPage}
        />
      </div>

      <PipelineUpload
        fetchPipelinesAgain={onFetchPipelines}
        isStaff={isStaff}
      />

      {isError && (
        <Alert type="error" description={<span>{error.message}</span>} />
      )}

      {isLoading ? (
        <SpinContainer title="Fetching the Packages" />
      ) : data?.registeredPipelines && data.registeredPipelines.length > 0 ? (
        <Collapse
          style={{ marginTop: "1em" }}
          onChange={onChange}
          activeKey={activeKeys}
          items={data.registeredPipelines.map((pipeline) => {
            const { name, id, description } = pipeline.data;
            return {
              key: id,
              label: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{name}</span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: isDarkTheme ? "#B8BBBE" : "#4F5255",
                      }}
                    >
                      {description}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant={
                        pipelineToAdd?.id === id ? "primary" : "secondary"
                      }
                      size="sm"
                      isDisabled={loadingResources?.[id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        const pipelineId = `${id}`;
                        const isSelected = pipelineToAdd?.id === id;
                        // This will handle both selection and accordion expansion
                        onSelectPipeline(pipelineId, isSelected);
                      }}
                    >
                      {loadingResources?.[id]
                        ? "Loading resources..."
                        : pipelineToAdd?.id === id
                          ? "Selected"
                          : "Select package"}
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      style={{
                        padding: "0.5em",
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();

                        downloadPipelineMutation.mutate(pipeline);
                      }}
                      icon={<DownloadIcon />}
                    />
                  </div>
                </div>
              ),
              children: (
                <div>
                  {resourceError?.[id] ? (
                    <Alert type="error" description={resourceError[id]} />
                  ) : loadingResources?.[id] ? (
                    <SpinContainer title="Fetching the resources for this package" />
                  ) : (
                    <PipelinesComponent pipeline={pipeline} />
                  )}
                </div>
              ),
            };
          })}
        />
      ) : (
        <EmptyStateComponent title="No Packages were found registered to this ChRIS instance" />
      )}
    </div>
  );
};
