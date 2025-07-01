import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import client from "../../../services/restClient";
import ProjectLayout from "../../Layouts/ProjectLayout";
import CommentsSection from "../../common/CommentsSection";
import BranchesPage from "../BranchesPage/BranchesPage";
import DepartmentsPage from "../DepartmentsPage/DepartmentsPage";
import ProfilesPage from "../ProfilesPage/ProfilesPage";
import CompanyAddressesPage from "../CompanyAddressesPage/CompanyAddressesPage";
import CompanyPhonesPage from "../CompanyPhonesPage/CompanyPhonesPage";
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import { classNames } from "primereact/utils";
import RecentService from "../../../services/RecentService";
import { Divider } from "primereact/divider";

const SingleCompaniesPage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState();
  const [addresses, setAddresses] = useState([]);
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
  const [newRecentItem, setNewRecentItem] = useState(null);
  const companyId = urlParams.singleCompaniesId;

  useEffect(() => {
    //on mount
    client
      .service("companies")
      .get(urlParams.singleCompaniesId, {
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
          ],
        },
      })
      .then((res) => {
        console.log("res", res);
        set_entity(res || {});
        const addresses = Array.isArray(res.addresses)
          ? res.addresses.map((elem) => ({
              _id: elem._id,
              Street1: elem.Street1,
            }))
          : res.addresses
            ? [{ _id: res.addresses._id, Street1: res.addresses.Street1 }]
            : [];
        setAddresses(addresses);
        const recentItem = {
          icon: "pi pi-building",
          label: "companies",
          url: `/companies/${res._id}`,
          mainMenu: "company",
          id: res._id,
          name: Object.values(res)[1],
        };
        setNewRecentItem(recentItem);
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed get companies",
        });
      });
  }, [props, urlParams.singleCompaniesId]);

  const goBack = () => {
    navigate(-1);
  };

  const helpSidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        helpSidebarRef.current &&
        !helpSidebarRef.current.contains(event.target) &&
        isHelpSidebarVisible
      ) {
        setHelpSidebarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHelpSidebarVisible]);

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

  const handleEditNavigation = () => {
    console.log("_entity:", companyId);
    navigate(`/companies/edit/${companyId}`);
  };

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
              <h3 className="m-0">Companies</h3>
              <SplitButton
                model={menuItems.filter(
                  (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
                )}
                dropdownIcon="pi pi-ellipsis-h"
                buttonClassName="hidden"
                menuButtonClassName="ml-1 p-button-text"
              />
            </div>
          </div>

          {/* Enhanced Company Header */}
          <div className="mt-4 mb-4">
            <h1 className="text-5xl font-bold text-900 mb-3">
              {_entity?.name}
            </h1>
            <Divider />
          </div>

          {/* Enhanced Details Grid */}
          <div className="grid w-full mt-3">
            <div className="col-12 md:col-6 lg:col-3 mb-4">
              <div className="p-3 surface-50 border-round">
                <label className="text-sm font-medium text-600 block mb-1">
                  Company No
                </label>
                <p className="m-0 text-700 text-lg">
                  <i className="pi pi-id-card mr-2 text-500"></i>
                  {_entity?.companyNo || "-"}
                </p>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3 mb-4">
              <div className="p-3 surface-50 border-round">
                <label className="text-sm font-medium text-600 block mb-1">
                  New Company Number
                </label>
                <p className="m-0 text-700 text-lg">
                  <i className="pi pi-sort-numeric-up mr-2 text-500"></i>
                  {Number(_entity?.newCompanyNumber) || "-"}
                </p>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3 mb-4">
              <div className="p-3 surface-50 border-round">
                <label className="text-sm font-medium text-600 block mb-1">
                  Date Incorporated
                </label>
                <p className="m-0 text-700 text-lg">
                  <i className="pi pi-calendar mr-2 text-500"></i>
                  {_entity?.DateIncorporated || "-"}
                </p>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3 mb-4">
              <div className="p-3 surface-50 border-round">
                <label className="text-sm font-medium text-600 block mb-1">
                  Is Default
                </label>
                <p className="m-0 text-700 text-lg">
                  <i
                    className={`pi mr-2 ${_entity?.isdefault === true ? "pi-check-circle text-green-500" : "pi-times-circle text-red-500"}`}
                  ></i>
                  {_entity?.isdefault ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="col-12 mb-4">
              <div className="p-3 surface-50 border-round">
                <label className="text-sm font-medium text-600 block mb-2">
                  Addresses
                </label>
                {addresses.length > 0 ? (
                  <div className="grid">
                    {addresses.map((elem) => (
                      <div className="col-12 md:col-6 lg:col-4" key={elem._id}>
                        <Link
                          to={`/companyAddresses/${elem._id}`}
                          className="no-underline"
                        >
                          <div className="p-3 border-1 surface-border border-round hover:surface-100 transition-colors transition-duration-150">
                            <div className="flex align-items-center">
                              <i className="pi pi-map-marker text-primary mr-2"></i>
                              <span className="text-700">{elem.Street1}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-500 italic">No addresses available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab View Section */}
        <div className="mt-5 w-full">
          <TabView className="shadow-1">
            <TabPanel header="Profiles" leftIcon="pi pi-user mr-2">
              <ProfilesPage />
            </TabPanel>
            <TabPanel header="Branches" leftIcon="pi pi-building-columns mr-2">
              <BranchesPage />
            </TabPanel>
            <TabPanel header="Departments" leftIcon="pi pi-briefcase mr-2">
              <DepartmentsPage />
            </TabPanel>
            <TabPanel header="Addresses" leftIcon="pi pi-map mr-2">
              <CompanyAddressesPage />
            </TabPanel>
            <TabPanel header="Phones" leftIcon="pi pi-phone mr-2">
              <CompanyPhonesPage />
            </TabPanel>
          </TabView>
        </div>
      </div>

      {/* Keep the rest of the components the same */}
      <CommentsSection
        recordId={urlParams.singleCompaniesId}
        user={props.user}
        alert={props.alert}
        serviceName="companies"
      />

      {newRecentItem && (
        <RecentService
          companyId={companyId}
          get={props.get}
          set={props.set}
          newRecentItem={newRecentItem}
        />
      )}

      {/* Help sidebar remains the same */}
      <div
        id="rightsidebar"
        className={classNames(
          "overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out",
          { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible },
        )}
        style={{
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          className="flex flex-column h-full p-4 bg-white"
          style={{ height: "calc(100% - 60px)", marginTop: "60px" }}
        >
          <span className="text-xl font-medium text-900 mb-3">Help bar</span>
          <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
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
  get: () => dispatch.cache.get(),
  set: (data) => dispatch.cache.set(data),
});

export default connect(mapState, mapDispatch)(SingleCompaniesPage);
