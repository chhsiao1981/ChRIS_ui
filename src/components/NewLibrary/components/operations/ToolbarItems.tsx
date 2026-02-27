import { ToolbarItem } from "@patternfly/react-core";
import { Fragment } from "react/jsx-runtime";
import { AddNodeProvider } from "../../../AddNode/context";
import { CreateFeedProvider } from "../../../CreateFeed/context";
import { PipelineProvider } from "../../../PipelinesCopy/context";
import CreateAnalysis from "./CreateAnalysis";
import Delete from "./Delete";
import Download from "./Download";
import Merge from "./Merge";
import PayloadList from "./PayloadList";
import Rename from "./Rename";
import Share from "./Share";
import UploadData from "./UploadData";

export default () => {
  return (
    <Fragment>
      {contextHolder}
      <ToolbarItem>
        <UploadData handleOperations={handleOperations} />
        {userRelatedError && (
          <AntdAlert
            style={{ marginLeft: "1rem" }}
            type="error"
            description={userRelatedError}
            closable
            onClose={() => setUserRelatedError("")}
          />
        )}
      </ToolbarItem>

      <ToolbarItem>
        <CreateFeedProvider>
          <PipelineProvider>
            <AddNodeProvider>
              <CreateAnalysis
                handleOperations={handleOperations}
                count={selectedPathsCount}
                isStaff={isStaff}
                useCart={useCart}
              />
            </AddNodeProvider>
          </PipelineProvider>
        </CreateFeedProvider>

        <Download
          handleOperations={handleOperations}
          count={selectedPathsCount}
        />

        <Merge handleOperations={handleOperations} count={selectedPathsCount} />

        <Share handleOperations={handleOperations} count={selectedPathsCount} />

        <Delete
          handleOperations={handleOperations}
          count={selectedPathsCount}
        />
      </ToolbarItem>

      <ToolbarItem>
        <Rename
          handleOperations={handleOperations}
          count={selectedPathsCount}
        />
      </ToolbarItem>

      <ToolbarItem>
        <PayloadList selectedPaths={selectedPaths} useCart={useCart} />
      </ToolbarItem>
    </Fragment>
  );
};
