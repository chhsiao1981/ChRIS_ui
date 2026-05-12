import { Flex, FlexItem } from "@patternfly/react-core";
import { useEffect, useState } from "react";
import { fetchNote } from "../../api/common";
import { Badge } from "../Antd";
import ButtonWithTooltip from "../DrawerUtils/ButtonWithTooltip";
import {
  AnalysisIcon,
  BrainIcon,
  FeedBrowserIcon,
  NodeDetailsPanelIcon,
  NoteEditIcon,
  PreviewIcon,
  TerminalIcon,
} from "../Icons";
import ButtonContainer from "./ButtonContainer";
import "./feed-details.css";
import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import * as DoDrawer from "../../reducers/drawer";
import * as DoFeed from "../../reducers/feed";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

export default () => {
  const useDrawer = useThunk<DoDrawer.State, TDoDrawer>(DoDrawer);
  const [classDrawer, doDrawer] = useDrawer;
  const drawer = getState(classDrawer) || DoDrawer.defaultState;
  const drawerID = getDefaultID(classDrawer);

  const useFeed = useThunk<DoFeed.State, TDoFeed>(DoFeed);
  const [classStateFeed, _] = useFeed;
  const feedState = getState(classStateFeed) || DoFeed.defaultState;

  const { data: currentFeed } = feedState;

  const node = drawer.node.currentlyActive === "node";
  const note = drawer.node.currentlyActive === "note";
  const terminal = drawer.node.currentlyActive === "terminal";
  const preview = drawer.preview.currentlyActive === "preview";

  const [showNoteBadge, setShowNoteBadge] = useState(false);

  useEffect(() => {
    fetchNote(currentFeed).then((feedNote) => {
      const showNote = !!(
        feedNote &&
        feedNote.data.content.length > 0 &&
        !note
      );
      setShowNoteBadge(showNote);
    });
  }, [note, currentFeed]);

  return (
    <Flex
      alignItems={{ default: "alignItemsCenter" }}
      justifyContent={{ default: "justifyContentCenter" }}
    >
      <FlexItem>
        <ButtonContainer
          actionType="graph"
          icon={<AnalysisIcon />}
          title="Feed Tree Panel"
          isDisabled={drawer.graph.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="node"
          title={node ? "Configuration Panel" : note ? "Feed Note" : "Terminal"}
          icon={
            node ? (
              <NodeDetailsPanelIcon />
            ) : note ? (
              <NoteEditIcon />
            ) : (
              <TerminalIcon />
            )
          }
          isDisabled={drawer.node.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="files"
          title="Files Table Panel"
          icon={<FeedBrowserIcon />}
          isDisabled={drawer.files.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="preview"
          title="Preview Panel"
          icon={preview ? <PreviewIcon /> : <BrainIcon />}
          isDisabled={drawer.preview.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonWithTooltip
          content={!node && terminal ? "Configuration Panel" : "Terminal"}
          position="bottom"
          className="button-style large-button"
          onClick={() => {
            if (terminal) {
              doDrawer.setDrawerCurrentlyActive(drawerID, "node", "node");
            } else {
              doDrawer.setDrawerCurrentlyActive(drawerID, "node", "terminal");
            }
          }}
          Icon={!node && terminal ? <NodeDetailsPanelIcon /> : <TerminalIcon />}
          isDisabled={false}
        />
      </FlexItem>

      <FlexItem>
        <Badge dot={!!(showNoteBadge && !note)} offset={[-5, 0]}>
          <ButtonWithTooltip
            className="button-style large-button"
            position="bottom"
            content={!note ? "Feed Note" : "Configuration Panel"}
            onClick={() => {
              if (note) {
                doDrawer.setDrawerCurrentlyActive(drawerID, "node", "node");
              } else {
                doDrawer.setDrawerCurrentlyActive(drawerID, "node", "note");
              }
            }}
            Icon={!node && note ? <NodeDetailsPanelIcon /> : <NoteEditIcon />}
            isDisabled={false}
          />
        </Badge>
      </FlexItem>

      <FlexItem>
        <ButtonWithTooltip
          className="button-style large-button"
          position="bottom"
          content={preview ? "Visualization Panel" : "Preview Panel"}
          onClick={() => {
            if (preview) {
              doDrawer.setDrawerCurrentlyActive(drawerID, "preview", "xtk");
            } else {
              doDrawer.setDrawerCurrentlyActive(drawerID, "preview", "preview");
            }
          }}
          Icon={preview ? <BrainIcon /> : <PreviewIcon />}
          isDisabled={false}
        />
      </FlexItem>
    </Flex>
  );
};
