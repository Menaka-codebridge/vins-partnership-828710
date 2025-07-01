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
import CaseLayout from "../CasePage/CaseLayoutPage";
import SectionContentsPage from "../SectionContentsPage/SectionContentsPage";
import CaseDocumentsPage from "../CaseDocumentsPage/CaseDocumentsPage";
import HistoriesPage from "../HistoriesPage/HistoriesPage";

const SingleAccidentCasesPage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState({});
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

  const [user, setUser] = useState([]);

  useEffect(() => {
    //on mount
    client
      .service("accidentCases")
      .get(urlParams.singleAccidentCasesId, {
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
            "user",
          ],
        },
      })
      .then((res) => {
        set_entity(res || {});
        const user = Array.isArray(res.user)
          ? res.user.map((elem) => ({ _id: elem._id, name: elem.name }))
          : res.user
            ? [{ _id: res.user._id, name: res.user.name }]
            : [];
        setUser(user);
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "AccidentCases",
          type: "error",
          message: error.message || "Failed get accidentCases",
        });
      });
  }, [props, urlParams.singleAccidentCasesId]);

  const goBack = () => {
    navigate("/accidentCases");
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
      <div>
        <CaseLayout />
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

export default connect(mapState, mapDispatch)(SingleAccidentCasesPage);
