import { Button, ExpandableSection, Grid } from "@patternfly/react-core";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router";
import type { Feed, PluginInstance } from "../../api/types";
import { isInstanceVisualDataset } from "../DatasetRedirect/isPlVisualDataset";
import { CalendarAltIcon, PreviewIcon } from "../Icons";
import ButtonGridItem from "./ButtonGridItem";
import GridItem from "./GridItem";
import styles from "./InstanceSummary.module.css";
import PluginTitle from "./PluginTitle";
import Status from "./Status";
import StatusTitle from "./StatusTitle";
import { getErrorCodeMessage, getExecTime } from "./utils";

type Props = {
  isHide: boolean;
  selectedInstance?: PluginInstance;
  feed?: Feed;
  data?: any;
};
export default (props: Props) => {
  const { isHide, selectedInstance, feed, data } = props;

  const isCancelled =
    selectedInstance?.status === "cancelled" ||
    selectedInstance?.status === "finishedWithError";

  const error_code = selectedInstance?.error_code;
  const compute_env = selectedInstance?.compute_resource_name;

  const [isExpanded, setIsExpanded] = useState(true);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);
  const navigate = useNavigate();

  const classNameVisualDataset = !isInstanceVisualDataset(selectedInstance)
    ? styles.hide
    : "";
  const classNameRoot = isHide ? styles.hide : "";
  return (
    <div className={classNameRoot}>
      <PluginTitle />
      <Grid className="node-details__grid">
        <GridItem title="Status">
          <StatusTitle pluginStatus={data?.pluginStatus} />
        </GridItem>
      </Grid>
      <Status pluginStatus={data?.pluginStatus} />

      <ExpandableSection
        toggleText={isExpanded ? "Show Less Details" : "Show More Details"}
        onToggle={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
        className="node-details__expandable"
      >
        <Grid className="node-details__grid">
          <GridItem title="Feed Name">{feed?.name}</GridItem>
          <GridItem title="Feed Author">{feed?.owner_username}</GridItem>

          <GridItem title="Parent Node ID">
            <span>{selectedInstance?.previous_id}</span>
          </GridItem>
          <GridItem title="Selected Node ID">
            <span>{selectedInstance?.id}</span>
          </GridItem>
          <GridItem title="Plugin">
            <span style={{ fontFamily: "monospace" }}>
              {selectedInstance?.plugin_name} v
              {selectedInstance?.plugin_version}
            </span>
          </GridItem>
          <GridItem title="Created">
            <CalendarAltIcon style={{ marginRight: "0.5em" }} />
            {selectedInstance?.start_date || ""}
          </GridItem>
          <GridItem title="Compute Environment">
            {" "}
            <span>{compute_env}</span>
          </GridItem>
          <Fragment>
            <GridItem title="Total Execution Time">
              <span>{getExecTime(selectedInstance)}</span>
            </GridItem>
          </Fragment>

          <GridItem title="Error Code" isHide={!isCancelled}>
            <span>
              {error_code ? (
                <span>
                  {error_code}&nbsp;
                  {isErrorExpanded && (
                    <span className="node-details__error-message">
                      {getErrorCodeMessage(error_code)}&nbsp;
                    </span>
                  )}
                  <Button
                    variant="link"
                    isInline
                    className="node-details__error-show-more"
                    onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                  >
                    (show {isErrorExpanded ? "less" : "more"})
                  </Button>
                </span>
              ) : (
                "None"
              )}
            </span>
          </GridItem>
        </Grid>
      </ExpandableSection>

      {/* Jennings: hastily adding an extra button here.
       *  IMO the Node Details pane should be cleaned up.
       */}
      <Grid className={classNameVisualDataset} hasGutter={true}>
        <ButtonGridItem>
          <Button
            icon={<PreviewIcon />}
            onClick={() => navigate(`/niivue/${selectedInstance?.id || ""}`)}
          >
            View Volumes{" "}
            {/* I didn't make this shortcut work, since none of them currently work in caae85dd1cb337c11179724eedf3b81ac6373aaa */}
            <span style={{ padding: "2px", color: "#F5F5DC" }}>( V )</span>
          </Button>
        </ButtonGridItem>
      </Grid>
    </div>
  );
};
