import {
  getDefaultID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  Brand,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { type DefaultError, useQueryClient } from "@tanstack/react-query";
import config from "config";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import brandImg from "../../assets/logo_chris_dashboard.png";
import type * as DoCart from "../../reducers/cart";
import type * as DoFeedList from "../../reducers/feedList";
import type * as DoOperation from "../../reducers/operation";
import { Role } from "../../reducers/types";
import * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import { AddModal } from "../NewLibrary/components/Operations";
import UploadData from "../NewLibrary/components/operations/UploadData";
import { OperationContext } from "../NewLibrary/context";
import { useFolderOperations } from "../NewLibrary/utils/useOperations";
import styles from "./Sidebar.module.css";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoCart = ThunkModuleToFunc<typeof DoCart>;
type TDoOperation = ThunkModuleToFunc<typeof DoOperation>;
type TDoFeedList = ThunkModuleToFunc<typeof DoFeedList>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useCart: UseThunk<DoCart.State, TDoCart>;

  operationID: string;
  useOperation: UseThunk<DoOperation.State, TDoOperation>;

  useFeedList: UseThunk<DoFeedList.State, TDoFeedList>;

  isLoggedIn: boolean;
};

type TagInfo = {
  title?: string;
};

export default (props: Props) => {
  const queryClient = useQueryClient();
  const {
    useUI,
    useUser,
    useCart,
    operationID,
    useOperation,
    useFeedList,
    isLoggedIn,
  } = props;
  const [classUI, doUI] = useUI;
  const [classUser, _2] = useUser;
  const ui = getState(classUI) || DoUI.defaultState;
  const uiID = getDefaultID(classUI);
  const user = getState(classUser) || DoUser.defaultState;
  const { sidebarActiveItem, isNavOpen, isTagExpanded, isPipelineTagExpanded } =
    ui;
  const { role, username } = user;

  const [classFeedList, _doFeedList] = useFeedList;
  const feedListID = getDefaultID(classFeedList);

  const onToggleTag = (e: FormEvent) => {
    doUI.setIsTagExpanded(uiID, !isTagExpanded);
  };
  const onTogglePipelineTag = (e: FormEvent) => {
    doUI.setIsPipelineTagExpanded(uiID, !isPipelineTagExpanded);
  };
  const onSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: any,
  ) => {
    const { itemId } = selectedItem;
    // Invalidate feeds if "analyses" is selected
    if (itemId === "analyses") {
      queryClient.refetchQueries({
        queryKey: ["feeds"], // This assumes your query key for feeds is ["feeds"]
      });
    }
  };

  const renderLink = (to: string, label: string, itemId: string) =>
    sidebarActiveItem === itemId ? (
      <span style={{ color: "#ffffff" }}>{label}</span>
    ) : (
      <Link to={to}>
        <span style={{ color: "#aaaaaa" }}>{label}</span>
      </Link>
    );

  const renderTag = (
    tag: TagInfo,
    idx: number,
    onClickMore: (e: FormEvent) => void,
    prefix: string,
  ) => {
    if (typeof tag.title === "undefined") {
      return (
        <NavItem
          key={prefix + "tag-more"}
          itemId="tag-more"
          onClick={onClickMore}
        >
          <span style={{ color: "#aaaaaa" }}>(more)</span>
        </NavItem>
      );
    }

    const tagIdx = `tag${idx}`;

    const tagLink = tag.title === "(none)" ? "" : `${tag.title}`;

    return (
      <NavItem
        key={prefix + tagIdx}
        itemId={tagIdx}
        isActive={sidebarActiveItem === tagIdx}
      >
        {renderLink(`${prefix}${tagLink}`, tag.title, tagIdx)}
      </NavItem>
    );
  };

  const renderTags = () => {
    const tagList: TagInfo[] = [
      { title: "uploaded" },
      { title: "public" },
      { title: "pacs" },
    ];
    if (!isTagExpanded) {
      tagList.push({});
    }

    console.info(
      "renderTags: isTagExpanded:",
      isTagExpanded,
      "tagList",
      tagList,
    );

    return (
      <>
        {tagList.map((each, idx) =>
          renderTag(each, idx, onToggleTag, "/data/tag/"),
        )}
      </>
    );
  };

  const renderPipelineTags = () => {
    const tagList: TagInfo[] = [{ title: "imported" }, { title: "composite" }];
    if (!isPipelineTagExpanded) {
      tagList.push({});
    }

    return (
      <>
        {tagList.map((each, idx) =>
          renderTag(each, idx, onTogglePipelineTag, "/pipelines/tag/"),
        )}
      </>
    );
  };

  const origin = {
    type: OperationContext.FEEDS,
    additionalKeys: [],
  };

  const { modalState, handleModalSubmitMutation, setModalState } =
    useFolderOperations(username, origin, useCart, undefined, undefined, true);

  const uploadDataColor =
    sidebarActiveItem === "uploadData" ? "#ffffff" : "#aaaaaa";

  // only the admin can import package.
  const classNameImportPipeline = role === Role.Admin ? undefined : styles.hide;
  // only the clinician cannot compose package.
  const classNameComposePipeline =
    role === Role.Clinician ? styles.hide : undefined;

  const stylesNavUser = isLoggedIn ? styles.nav : styles.hide;
  const stylesNavGuest = isLoggedIn ? styles.hide : styles.nav;
  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>
        <div className={styles["page-sidebar"]}>
          {/* user */}
          <div className={stylesNavUser}>
            {" "}
            <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
              <NavList>
                <NavGroup key="theData" title="Data">
                  <NavItem
                    key="data"
                    itemId="data"
                    isActive={sidebarActiveItem === "data"}
                  >
                    {renderLink("/data", "My Data", "data")}
                  </NavItem>
                  <NavItem
                    key="shared"
                    itemId="shared"
                    isActive={sidebarActiveItem === "shared"}
                  >
                    {renderLink("/shared", "Shared Data", "shared")}
                  </NavItem>

                  <NavItem
                    key="lib"
                    itemId="lib"
                    isActive={sidebarActiveItem === "lib"}
                  >
                    {renderLink("/library", "Library", "lib")}
                  </NavItem>

                  <NavExpandable
                    key="tags"
                    title="Tags"
                    buttonProps={{ className: styles["tags-expand"] }}
                    isExpanded={true}
                  >
                    {renderTags()}
                  </NavExpandable>

                  <NavItem
                    key="uploadData"
                    itemId="uploadData"
                    isActive={sidebarActiveItem === "uploadData"}
                  >
                    <UploadData
                      operationID={operationID}
                      useOperation={useOperation}
                      useCart={useCart}
                      useUser={useUser}
                      isSidebar={true}
                      buttonColor={uploadDataColor}
                      feedListID={feedListID}
                      useFeedList={useFeedList}
                    />
                  </NavItem>

                  <NavItem
                    key="pacs"
                    itemId="pacs"
                    isActive={sidebarActiveItem === "pacs"}
                  >
                    {renderLink("/pacs", "Query and Retrieve PACS", "pacs")}
                  </NavItem>
                </NavGroup>
                <NavGroup key="packages" title="Pipelines">
                  <NavItem
                    key="pipeline"
                    itemId="pipeline"
                    isActive={sidebarActiveItem === "pipeline"}
                  >
                    {renderLink("/pipelines", "Browse Pipelines", "pipeline")}
                  </NavItem>

                  <NavExpandable
                    key="pipelineTags"
                    title="Tags"
                    buttonProps={{ className: styles["tags-expand"] }}
                    isExpanded={true}
                  >
                    {renderPipelineTags()}
                  </NavExpandable>

                  {
                    /* config is statically assigned,
                       can be used as conditional statement */
                    config.STORE_ROOT && (
                      <NavItem
                        key="store"
                        itemId="store"
                        isActive={sidebarActiveItem === "store"}
                        className={classNameImportPipeline}
                      >
                        {renderLink("/import", "Import Pipeline", "store")}
                      </NavItem>
                    )
                  }
                  <NavItem
                    key="compose"
                    itemId="compose"
                    isActive={sidebarActiveItem === "compose"}
                    className={classNameComposePipeline}
                  >
                    {renderLink("/compose", "Compose Pipeline", "compose")}
                  </NavItem>
                </NavGroup>
              </NavList>
            </Nav>
            <AddModal
              modalState={modalState}
              onClose={() => {
                handleModalSubmitMutation.reset();
                setModalState({ isOpen: false, type: "" });
              }}
              onSubmit={(inputValue, additionalValues) =>
                handleModalSubmitMutation.mutate({
                  inputValue,
                  additionalValues,
                })
              }
              indicators={{
                isPending: handleModalSubmitMutation.isPending,
                isError: handleModalSubmitMutation.isError,
                error: handleModalSubmitMutation.error as DefaultError,
                clearErrors: () => handleModalSubmitMutation.reset(),
              }}
            />
          </div>

          {/* guest */}
          <div className={stylesNavGuest}>
            {" "}
            <Nav>
              <NavList>
                <NavGroup title="Discover ChRIS">
                  <NavItem
                    itemId="overview"
                    isActive={sidebarActiveItem === "overview"}
                  >
                    <Link to="/">Overview</Link>
                  </NavItem>
                  <NavItem
                    itemId="shared"
                    isActive={sidebarActiveItem === "shared"}
                  >
                    <Link to="/shared">Shared Data</Link>
                  </NavItem>

                  <NavItem
                    itemId="package"
                    isActive={sidebarActiveItem === "package"}
                  >
                    <Link to="/package">Browse Packages</Link>
                  </NavItem>
                </NavGroup>
              </NavList>
            </Nav>
          </div>
          <div className={styles.brand}>
            <Brand src={brandImg} alt="ChRIS Logo" />
          </div>
        </div>
      </PageSidebarBody>
    </PageSidebar>
  );
};
