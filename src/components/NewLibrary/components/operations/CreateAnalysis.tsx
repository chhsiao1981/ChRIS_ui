import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
  useThunk,
} from "@chhsiao1981/use-thunk";
import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { catchError } from "../../../../api/common";
import { getFeed, getPluginInstances } from "../../../../api/serverApi";
import type { PluginInstance } from "../../../../api/types";
import * as DoCart from "../../../../reducers/cart";
import * as DoMainRouter from "../../../../reducers/mainRouter";
import type { CartSelectionPayload } from "../../../../reducers/types";
import { AddNodeContext } from "../../../AddNode/context";
import BasicInformation from "../../../CreateFeed/BasicInformation";
import { CreateFeedContext } from "../../../CreateFeed/context";
import { createFeeds } from "../../../CreateFeed/createFeedHelper";
import Review from "../../../CreateFeed/Review";
import withSelectionAlert from "../../../CreateFeed/SelectionAlert";
import { type ChRISFeed, Types } from "../../../CreateFeed/types/feed";
import { AnalysisIcon } from "../../../Icons";
import PipelinesCopy from "../../../PipelinesCopy";
import { PipelineContext } from "../../../PipelinesCopy/context";
import OperationButton from "./OperationButton";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoMainRouter = ThunkModuleToFunc<typeof DoMainRouter>;

type Props = {
  handleOperations: (operationKey: string) => void;
  count: number;
  isStaff: boolean;
  useCart: UseThunk<DoCart.State, TDoCart>;
};
export default (props: Props) => {
  const { count, isStaff, useCart } = props;
  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const queryClient = useQueryClient();

  const useMainRouter = useThunk<DoMainRouter.State, TDoMainRouter>(
    DoMainRouter,
  );
  const [classStateMainRouter, doMainRouter] = useMainRouter;
  const mainRouterID = getDefaultID(classStateMainRouter);

  const { state: stateCreateFeed, dispatch: dispatchCreateFeed } =
    useContext(CreateFeedContext);
  const {
    wizardOpen,
    data: dataCreateFeed,
    selectedConfig: createFeedConfig,
  } = stateCreateFeed;
  const { chrisFiles } = dataCreateFeed;

  const { state: addNodeState, dispatch: nodeDispatch } =
    useContext(AddNodeContext);
  const { pluginMeta } = addNodeState;

  const { state: pipelineState, dispatch: pipelineDispatch } =
    useContext(PipelineContext);

  const [feedProcessing, setFeedProcessing] = useState(false);

  const ariaLabel =
    count === 1 ? "Create a new analysis" : "Create new analyses";

  const label = count === 1 ? "Create Analysis" : "Create Analyses";

  const closeWizard = () => {
    console.info("CreateAnalysis.closeWizard");
    dispatchCreateFeed({
      type: Types.ToggleWizard,
    });

    nodeDispatch({
      type: Types.ResetState,
    });
  };

  const resetAfterCompletion = () => {
    dispatchCreateFeed({
      type: Types.ResetState,
    });
    pipelineDispatch({
      type: Types.ResetState,
    });
    doMainRouter.clearFeedData(mainRouterID);
  };

  const getFeedError = (error: any) => {
    dispatchCreateFeed({
      type: Types.SetError,
      payload: {
        feedError: error,
      },
    });
  };

  const handleSave = async () => {
    console.info(
      "CreateAnalysis: handleSave: start: dataCreateFeed.chrisFiles:",
      dataCreateFeed.chrisFiles,
      "data:",
      dataCreateFeed,
      "selectedConfig:",
      createFeedConfig,
      "pipelineState:",
      pipelineState,
    );
    setFeedProcessing(true);
    dispatchCreateFeed({
      type: Types.SetFeedCreationState,
      payload: {
        status: "Creating Feed",
      },
    });

    try {
      await createFeeds(
        dataCreateFeed,
        "",
        () => {},
        createFeedConfig,
        pipelineState,
      );

      queryClient.refetchQueries({
        queryKey: ["feeds"],
      });

      dispatchCreateFeed({
        type: Types.SetFeedCreationState,
        payload: {
          status: "Feed Created Successfully",
        },
      });

      setTimeout(() => {
        setFeedProcessing(false);
        resetAfterCompletion();
      }, 1000);

      /**
         * @deprecated
         * The following code is deprecated and should not be used.
         * It sets analysis tags on the feed.


          for (const tag of state.data.tags) {
          feed.tagFeed(tag.data.id);
           }
          */

      /*
        // Set analysis description
        const note = await feed.getNote();

        await note.put({
          title: "Description",
          content: stateCreateFeed.data.feedDescription,
        });

        queryClient.refetchQueries({
          queryKey: ["feeds"],
        });

        dispatchCreateFeed({
          type: Types.SetFeedCreationState,
          payload: {
            status: "Feed Created Successfully",
          },
        });

        setTimeout(() => {
          setFeedProcessing(false);
          resetAfterCompletion();
        }, 1500);
      }
        */
    } catch (error) {
      const errorObj = catchError(error);
      getFeedError(errorObj);
      setFeedProcessing(false);
    }
  };

  const pathInfoToFeedID = (pathInfo: CartSelectionPayload): number => {
    // home/chris/feeds/feed_14
    const thePathList = pathInfo.path.split("/");
    const feedID = Number.parseInt(
      thePathList[thePathList.length - 1].split("_")[1],
    );
    return feedID;
  };

  const feedIDToLastChRISFile = async (feedID: number): Promise<ChRISFeed> => {
    const pluginInstances = await getPluginInstances(feedID);
    if (!pluginInstances.data) {
      return { name: "", filename: "", theID: -1, createDateTime: "" };
    }

    const feed = await getFeed(feedID);
    if (!feed.data) {
      return { name: "", filename: "", theID: -1, createDateTime: "" };
    }

    console.info(
      "CreateAnalysis.feedIDToLastFilename: feedID:",
      feedID,
      "data:",
      pluginInstances.data,
    );
    pluginInstances.data.sort((a: PluginInstance, b: PluginInstance) => {
      if (b.id < a.id) {
        return -1;
      } else if (b.id > a.id) {
        return 1;
      } else {
        return 0;
      }
    });
    const { output_path: filename } = pluginInstances.data[0];

    console.info("feedIDToLastChRISFile: feedID:", feedID, "feed:", feed);

    const { name, id, creation_date } = feed.data;

    const createDateTime = creation_date
      .replace(/\..*/, "")
      .replace(/[:]/g, "");

    return { name, filename, theID: id, createDateTime };
  };

  const pathInfoToChRISFiles = async (pathInfo: CartSelectionPayload) => {
    const feedID = pathInfoToFeedID(pathInfo);
    const lastChRISFile = await feedIDToLastChRISFile(feedID);

    return lastChRISFile;
  };

  const handleOperations = () => {
    console.info(
      "CreateAnalysis.handleOperations: start: selectedPaths:",
      selectedPaths,
    );

    closeWizard();

    dispatchCreateFeed({
      type: Types.SelectedConfig,
      payload: {
        selectedConfig: [...stateCreateFeed.selectedConfig, "swift_storage"],
      },
    });

    const chrisFilesIncludes = (chrisFile: ChRISFeed) => {
      return chrisFiles.reduce((r, each) => {
        if (each.filename === chrisFile.filename) {
          return true;
        }
        return r;
      }, false);
    };

    const resolvedPromises = selectedPaths
      .map(pathInfoToChRISFiles)
      .map((eachPromise) => Promise.resolve(eachPromise));

    // biome-ignore lint/suspicious/useIterableCallbackReturn: always return void
    resolvedPromises.map((eachPromise) => {
      eachPromise.then((chrisFile) => {
        console.info("CreateAnalysis.handleOperations: chrisFile:", chrisFile);
        if (chrisFilesIncludes(chrisFile)) {
          return;
        }

        dispatchCreateFeed({
          type: Types.AddChrisFile,
          payload: {
            file: chrisFile,
            checkedKeys: [chrisFile.filename],
          },
        });
      });
    });
  };

  const enableSave = !!(
    dataCreateFeed.chrisFiles.length > 0 || typeof pluginMeta !== "undefined"
  );

  console.info(
    "CreateAnalysis: to render: isWizardOpen:",
    wizardOpen,
    "chrisFiles:",
    chrisFiles,
    "createFeedConfig:",
    createFeedConfig,
  );

  return (
    <>
      <OperationButton
        handleOperations={handleOperations}
        count={count}
        icon={<AnalysisIcon />}
        ariaLabel={ariaLabel}
        operationKey="createFeed"
        label={label}
      />

      <Modal
        aria-label="Wizard Modal"
        showClose={false}
        hasNoBodyWrapper
        variant={ModalVariant.large}
        isOpen={wizardOpen}
      >
        <Wizard
          onClose={() => closeWizard()}
          header={
            <WizardHeader
              onClose={() => {
                if (wizardOpen) {
                  resetAfterCompletion();
                }
              }}
              title="Create a New Analysis"
              description="This wizard allows you to create a new Analysis"
            />
          }
          height={500}
          width={"100%"}
          title="Create a New Analysis"
        >
          <WizardStep
            id={1}
            name="Basic-Information"
            footer={{
              isNextDisabled: !dataCreateFeed.feedName,
              isBackDisabled: true,
            }}
          >
            {withSelectionAlert(<BasicInformation />)}
          </WizardStep>
          <WizardStep id={3} name="Pipelines">
            <PipelinesCopy isStaff={isStaff} />
          </WizardStep>
          <WizardStep
            id={4}
            name="Review"
            footer={{
              onNext: handleSave,
              nextButtonText: "Create Analysis",
              isNextDisabled: !!(!enableSave || feedProcessing),
            }}
          >
            <Review handleSave={handleSave} />
          </WizardStep>
        </Wizard>
      </Modal>
    </>
  );
};
