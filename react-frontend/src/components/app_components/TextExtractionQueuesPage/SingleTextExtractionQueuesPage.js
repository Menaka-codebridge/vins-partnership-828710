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

const SingleTextExtractionQueuesPage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState({});
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

  const [caseDocumentId, setCaseDocumentId] = useState([]);
  const [documentStorageId, setDocumentStorageId] = useState([]);
  const [caseNo, setCaseNo] = useState([]);

  useEffect(() => {
    //on mount
    client
      .service("textExtractionQueues")
      .get(urlParams.singleTextExtractionQueuesId, {
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
            "caseDocumentId",
            "documentStorageId",
            "caseNo",
          ],
        },
      })
      .then((res) => {
        set_entity(res || {});
        const caseDocumentId = Array.isArray(res.caseDocumentId)
          ? res.caseDocumentId.map((elem) => ({
              _id: elem._id,
              caseNo: elem.caseNo,
            }))
          : res.caseDocumentId
            ? [
                {
                  _id: res.caseDocumentId._id,
                  caseNo: res.caseDocumentId.caseNo,
                },
              ]
            : [];
        setCaseDocumentId(caseDocumentId);
        const documentStorageId = Array.isArray(res.documentStorageId)
          ? res.documentStorageId.map((elem) => ({
              _id: elem._id,
              caseNo: elem.caseNo,
            }))
          : res.documentStorageId
            ? [
                {
                  _id: res.documentStorageId._id,
                  caseNo: res.documentStorageId.caseNo,
                },
              ]
            : [];
        setDocumentStorageId(documentStorageId);
        const caseNo = Array.isArray(res.caseNo)
          ? res.caseNo.map((elem) => ({ _id: elem._id, caseNo: elem.caseNo }))
          : res.caseNo
            ? [{ _id: res.caseNo._id, caseNo: res.caseNo.caseNo }]
            : [];
        setCaseNo(caseNo);
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "TextExtractionQueues",
          type: "error",
          message: error.message || "Failed get textExtractionQueues",
        });
      });
  }, [props, urlParams.singleTextExtractionQueuesId]);

  const goBack = () => {
    navigate("/textExtractionQueues");
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
              <h3 className="m-0">Text Extraction Queues</h3>
              <SplitButton
                model={menuItems.filter(
                  (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
                )}
                dropdownIcon="pi pi-ellipsis-h"
                buttonClassName="hidden"
                menuButtonClassName="ml-1 p-button-text"
              />
            </div>

            {/* <p>textExtractionQueues/{urlParams.singleTextExtractionQueuesId}</p> */}
          </div>
          <div className="card w-full">
            <div className="grid ">
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Document Type</label>
                <p className="m-0 ml-3">{_entity?.documentType}</p>
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">
                  Case Document Id
                </label>
                {caseDocumentId.map((elem) => (
                  <Link key={elem._id} to={`/caseDocuments/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.caseNo}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">
                  Document Storage Id
                </label>
                {documentStorageId.map((elem) => (
                  <Link key={elem._id} to={`/caseDocuments/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.caseNo}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <label className="text-sm text-gray-600">Case No</label>
                {caseNo.map((elem) => (
                  <Link key={elem._id} to={`/accidentCases/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.caseNo}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="col-12">&nbsp;</div>
            </div>
          </div>
        </div>

        <CommentsSection
          recordId={urlParams.singleTextExtractionQueuesId}
          user={props.user}
          alert={props.alert}
          serviceName="textExtractionQueues"
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

export default connect(mapState, mapDispatch)(SingleTextExtractionQueuesPage);
