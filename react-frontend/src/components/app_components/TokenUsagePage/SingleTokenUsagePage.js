import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import client from "../../../services/restClient";
import CommentsSection from "../../common/CommentsSection";
import ProjectLayout from "../../Layouts/ProjectLayout";

const SingleTokenUsagePage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState({});
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

  const [sectionContentId, setSectionContentId] = useState([]);
  const [promptQueueId, setPromptQueueId] = useState([]);
  const [summonsNo, setSummonsNo] = useState([]);

  useEffect(() => {
    //on mount
    client
      .service("tokenUsage")
      .get(urlParams.singleTokenUsageId, {
        query: {
          $populate: [
            {
              path: "createdBy",
              service: "users",
              select: ["name"],
            },
            {
              path: "updatedBy",
              service: "users",
              select: ["name"],
            },
            "sectionContentId",
            "promptQueueId",
            "summonsNo",
          ],
        },
      })
      .then((res) => {
        set_entity(res || {});
        const sectionContentId = Array.isArray(res.sectionContentId)
          ? res.sectionContentId.map((elem) => ({
              _id: elem._id,
              name: elem.name,
            }))
          : res.sectionContentId
            ? [
                {
                  _id: res.sectionContentId._id,
                  name: res.sectionContentId.name,
                },
              ]
            : [];
        setSectionContentId(sectionContentId);
        const promptQueueId = Array.isArray(res.promptQueueId)
          ? res.promptQueueId.map((elem) => ({
              _id: elem._id,
              name: elem.name,
            }))
          : res.promptQueueId
            ? [{ _id: res.promptQueueId._id, name: res.promptQueueId.name }]
            : [];
        setPromptQueueId(promptQueueId);
        const summonsNo = Array.isArray(res.summonsNo)
          ? res.summonsNo.map((elem) => ({ _id: elem._id, name: elem.name }))
          : res.summonsNo
            ? [{ _id: res.summonsNo._id, name: res.summonsNo.name }]
            : [];
        setSummonsNo(summonsNo);
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "TokenUsage",
          type: "error",
          message: error.message || "Failed get tokenUsage",
        });
      });
  }, [props, urlParams.singleTokenUsageId]);

  const goBack = () => {
    navigate("/tokenUsage");
  };

  const toggleHelpSidebar = () => {
    setHelpSidebarVisible(!isHelpSidebarVisible);
  };

  const copyPageLink = () => {
    const currentUrl = window.location.href;

    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        props.alert({
          title: "Link Copied",
          type: "success",
          message: "Page link copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        props.alert({
          title: "Error",
          type: "error",
          message: "Failed to copy page link.",
        });
      });
  };

  const menuItems = [
    {
      label: "Copy link",
      icon: "pi pi-copy",
      command: () => copyPageLink(),
    },
    {
      label: "Help",
      icon: "pi pi-question-circle",
      command: () => toggleHelpSidebar(),
    },
  ];

  return (
    <ProjectLayout>
      <div className="col-12 flex flex-column align-items-center">
        <div className="col-12">
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center">
              <Button
                className="p-button-text"
                icon="pi pi-chevron-left"
                onClick={() => goBack()}
              />
              <h3 className="m-0">TokenUsage</h3>
              <SplitButton
                model={menuItems.filter(
                  (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
                )}
                dropdownIcon="pi pi-ellipsis-h"
                buttonClassName="hidden"
                menuButtonClassName="ml-1 p-button-text"
              />
            </div>

            {/* <p>tokenUsage/{urlParams.singleTokenUsageId}</p> */}
          </div>
          <div className="card w-full">
            <div className="grid ">
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Job Id</label>
                <p className="m-0 ml-3">{_entity?.jobId}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Section</label>
                <p className="m-0 ml-3">{_entity?.section}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Subsection</label>
                <p className="m-0 ml-3">{_entity?.subsection}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Input Tokens</label>
                <p className="m-0 ml-3">{Number(_entity?.inputTokens)}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Output Tokens</label>
                <p className="m-0 ml-3">{Number(_entity?.outputTokens)}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Total Tokens</label>
                <p className="m-0 ml-3">{Number(_entity?.totalTokens)}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Model Id</label>
                <p className="m-0 ml-3">{_entity?.modelId}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">
                  Section Content Id
                </label>
                {sectionContentId.map((elem) => (
                  <Link key={elem._id} to={`/companies/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Prompt Queue Id</label>
                {promptQueueId.map((elem) => (
                  <Link key={elem._id} to={`/companies/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Summons No</label>
                {summonsNo.map((elem) => (
                  <Link key={elem._id} to={`/users/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="col-12">&nbsp;</div>
            </div>
          </div>
        </div>

        <CommentsSection
          recordId={urlParams.singleTokenUsageId}
          user={props.user}
          alert={props.alert}
          serviceName="tokenUsage"
        />
        <div
          id="rightsidebar"
          className={classNames(
            "overlay-auto z-1 surface-overlay shadow-2 absolute right-0 w-20rem animation-duration-150 animation-ease-in-out",
            { hidden: !isHelpSidebarVisible },
          )}
          style={{ top: "60px", height: "calc(100% - 60px)" }}
        >
          <div className="flex flex-column h-full p-4">
            <span className="text-xl font-medium text-900 mb-3">Help bar</span>
            <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(SingleTokenUsagePage);
