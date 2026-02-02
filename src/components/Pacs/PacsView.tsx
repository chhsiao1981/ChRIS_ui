import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { Empty, Flex, Spin, Typography } from "antd";
import type { CSSProperties } from "react";
import type { PACSqueryCore } from "../../api/pfdcm";
import * as DoPacs from "../../reducers/pacs";
import PacsInput from "./components/PacsInput.tsx";
import PacsStudiesView from "./components/PacsStudiesView.tsx";
import type { PacsState } from "./types.ts";

type TDoPacs = ThunkModuleToFunc<typeof DoPacs>;

type Props = {
  state: PacsState;
  isLoadingStudies?: boolean;
};

/**
 * PACS Query and Retrieve view component.
 *
 * This component has a text input field for specifying a PACS query,
 * and will display studies and series found in PACS.
 */
export default (props: Props) => {
  const {
    state: { preferences },
    isLoadingStudies,
  } = props;

  const [classStatePacs, doPacs] = useThunk<DoPacs.State, TDoPacs>(DoPacs);
  const pacsID = getRootID(classStatePacs);
  const pacs = getState(classStatePacs) ?? DoPacs.defaultState;
  const { studies, services, service, expandedStudyUids } = pacs;

  const setService = (service: string) => {
    doPacs.setService(pacsID, service);
  };

  const onSubmit = (service: string, prompt: string, value: string) => {
    doPacs.queryPacsStudies(pacsID, service, prompt, value);
  };

  const onRetrieve = (query: PACSqueryCore) => {
    doPacs.expandStudies(pacsID, service, query, studies);
    doPacs.retrievePACS(pacsID, service, query);
  };

  const onStudyExpand = (StudyInstanceUIDs: ReadonlyArray<string>) => {
    doPacs.onStudyExpand(pacsID, service, StudyInstanceUIDs);
  };

  // CSS
  const pacsStudiesViewStyle: CSSProperties = {
    position: "relative",
    minHeight: isLoadingStudies ? "200px" : "auto",
  };
  if (!studies) {
    pacsStudiesViewStyle.display = "none";
  }
  const studyList = studies || [];

  const searchImageStyle: CSSProperties = {
    height: "100%",
  };
  if (studies) {
    searchImageStyle.display = "none";
  }

  const loadingStyle: CSSProperties = {
    position: isLoadingStudies ? "absolute" : "static",
    top: "50%",
    left: "50%",
    transform: isLoadingStudies ? "translate(-50%, -50%)" : "none",
    zIndex: 100,
  };

  console.info("PacsView: studyList:", studyList);

  // return
  return (
    <>
      <PacsInput
        onSubmit={onSubmit}
        services={services}
        service={service}
        setService={setService}
        studies={studies}
      />
      <br />
      <div style={pacsStudiesViewStyle}>
        <Spin
          spinning={isLoadingStudies}
          size="large"
          tip={<Typography.Text strong>Loading studies...</Typography.Text>}
          style={loadingStyle}
        />
        <div style={{ opacity: isLoadingStudies ? 0.5 : 1 }}>
          <PacsStudiesView
            preferences={preferences}
            studies={studyList}
            onRetrieve={onRetrieve}
            expandedStudyUids={expandedStudyUids}
            onStudyExpand={onStudyExpand}
          />
        </div>
      </div>
      <Flex align="center" justify="center" style={searchImageStyle}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Enter a search to get started."
        />
      </Flex>
    </>
  );
};
