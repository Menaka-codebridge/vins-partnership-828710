import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import _ from "lodash";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
import client from "../../../services/restClient";
import entityCreate from "../../../utils/entity";
import DownloadCSV from "../../../utils/DownloadCSV";
import AreYouSureDialog from "../../common/AreYouSureDialog";
import CompaniesDatatable from "./CompaniesDataTable";
import CompaniesEditDialogComponent from "./CompaniesEditDialogComponent";
import CompaniesCreateDialogComponent from "./CompaniesCreateDialogComponent";
import CompaniesFakerDialogComponent from "./CompaniesFakerDialogComponent";
import CompaniesSeederDialogComponent from "./CompaniesSeederDialogComponent";
import SortIcon from "../../../assets/media/Sort.png";
import FilterIcon from "../../../assets/media/Filter.png";
import FavouriteService from "../../../services/FavouriteService";
import { v4 as uuidv4 } from "uuid";
import HelpbarService from "../../../services/HelpbarService";
import SortMenu from "../../../services/SortMenu";
import FilterMenu from "../../../services/FilterMenu";

const CompaniesPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAreYouSureDialog, setShowAreYouSureDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRecord, setRecord] = useState({});
  const [showFakerDialog, setShowFakerDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showSeederDialog, setShowSeederDialog] = useState(false);
  const [selectedEntityIndex, setSelectedEntityIndex] = useState();
  const [showUpload, setShowUpload] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilterFields, setSelectedFilterFields] = useState([]);
  const [selectedHideFields, setSelectedHideFields] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const urlParams = useParams();
  const filename = "companies";
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const [selectedDelete, setSelectedDelete] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [permissions, setPermissions] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [paginatorRecordsNo, setPaginatorRecordsNo] = useState(10);
  const [activeSort, setActiveSort] = useState(null);

  const getOrSetTabId = () => {
    let tabId = sessionStorage.getItem("browserTabId");
    if (!tabId) {
      tabId = uuidv4();
      sessionStorage.setItem("browserTabId", tabId);
    }
    return tabId;
  };

  useEffect(() => {
    const tabId = getOrSetTabId();
    if (selectedUser) {
      localStorage.setItem(`selectedUser_${tabId}`, selectedUser);
    }
  }, [selectedUser]);

  const toggleHelpSidebar = () => {
    setHelpSidebarVisible(!isHelpSidebarVisible);
  };

  const favouriteItem = {
    icon: "pi pi-building",
    label: "companies",
    url: "/companies",
    mainMenu: "company",
  };

  useEffect(() => {
    const _getSchema = async () => {
      const _schema = await props.getSchema("companies");
      const excludedFields = [
        "_id",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt",
      ];
      const _fields = _schema.data
        .filter((field) => !excludedFields.includes(field.field))
        .map((field) => {
          const fieldName = field.field
            .split(".")
            .map((part) =>
              part
                .replace(/([A-Z])/g, " $1")
                .trim()
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            )
            .join(" ");
          return {
            name: fieldName,
            value: field.field,
          };
        });
      setFields(_fields);
      const _hideFields = _schema.data
        .map((field, i) => i > 5 && field.field)
        .filter(Boolean);
      setSelectedHideFields(_hideFields);
    };
    _getSchema();
    if (location?.state?.action === "create") {
      entityCreate(location, setRecord);
      setShowCreateDialog(true);
    } else if (location?.state?.action === "edit") {
      setShowCreateDialog(true);
    }
  }, []);

  useEffect(() => {
    //on mount
    setLoading(true);
    props.show();
    client
      .service("companies")
      .find({
        query: {
          $limit: 10000,
          $sort: { name: 1 },
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
        let results = res.data;

        setData(results);
        setInitialData(results);
        props.hide();
        setLoading(false);
      })
      .catch((error) => {
        console.log({ error });
        setLoading(false);
        props.hide();
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed get Companies",
        });
      });
  }, [
    showFakerDialog,
    showDeleteAllDialog,
    showEditDialog,
    showCreateDialog,
    refresh,
  ]);

  const onClickSaveFilteredfields = (ff) => {
    setSelectedFilterFields(ff);
    setShowFilter(false);
  };

  const onClickSaveHiddenfields = (ff) => {
    // setSelectedHideFields(ff);
    // setShowColumns(false);
  };
  const onEditRow = (rowData, rowIndex) => {
    setSelectedEntityIndex(rowData._id);
    setShowEditDialog(true);
  };

  const onCreateResult = (newEntity) => {
    setData([...data, newEntity]);
  };
  const onFakerCreateResults = (newEntities) => {
    setSelectedEntityIndex();
    setData([...data, ...newEntities]);
  };
  const onSeederResults = (newEntities) => {
    setSelectedEntityIndex();
    setData([...data, ...newEntities]);
  };

  const onEditResult = (newEntity) => {
    let _newData = _.cloneDeep(data);
    _.set(_newData, { _id: selectedEntityIndex }, newEntity);
    setData(_newData);
  };

  const deleteRow = async () => {
    try {
      await client.service("companies").remove(selectedEntityIndex);
      let _newData = data.filter((data) => data._id !== selectedEntityIndex);
      setData(_newData);
      setSelectedEntityIndex();
      setShowAreYouSureDialog(false);
    } catch (error) {
      console.log({ error });
      props.alert({
        title: "Companies",
        type: "error",
        message: error.message || "Failed delete record",
      });
    }
  };
  const onRowDelete = (index) => {
    setSelectedEntityIndex(index);
    setShowAreYouSureDialog(true);
  };

  const onShowDeleteAll = (rowData, rowIndex) => {
    setShowDeleteAllDialog(true);
  };

  const deleteAll = async () => {
    setLoading(true);
    props.show();
    const countDataItems = data?.length;
    const promises = data.map((e) => client.service("companies").remove(e._id));
    await Promise.all(
      promises.map((p) =>
        p.catch((error) => {
          props.alert({
            title: "Companies",
            type: "error",
            message: error.message || "Failed to delete all records",
          });
          setLoading(false);
          props.hide();
          console.log({ error });
        }),
      ),
    );
    props.hide();
    setLoading(false);
    setShowDeleteAllDialog(false);
    await props.alert({
      title: "Companies",
      type: "warn",
      message: `Successfully dropped ${countDataItems} records`,
    });
  };

  const onRowClick = ({ data }) => {
    navigate(`/companies/${data._id}`);
  };

  const handleEditNavigation = (rowData) => {
    navigate(`/companies/edit/${rowData._id}`);
  };

  const handleAddNavigation = () => {
    navigate("/companies/create");
  };

  const copyPageLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        props.alert({
          title: "Copied",
          type: "success",
          message: "Page link copied to clipboard",
        });
      })
      .catch((error) => {
        props.alert({
          title: "Error",
          type: "error",
          message: "Failed to copy page link",
        });
        console.error("Failed to copy: ", error);
      });
  };

  const menuItems = [
    {
      label: "Copy link",
      icon: "pi pi-copy",
      command: () => copyPageLink(),
    },
    permissions.import
      ? {
          label: "Import",
          icon: "pi pi-upload",
          command: () => setShowUpload(true),
        }
      : null,
    permissions.export
      ? {
          label: "Export",
          icon: "pi pi-download",
          command: () => {
            data.length > 0
              ? setTriggerDownload(true)
              : props.alert({
                  title: "Export",
                  type: "warn",
                  message: "no data to export",
                });
          },
        }
      : null,
    {
      label: "Help",
      icon: "pi pi-question-circle",
      command: () => toggleHelpSidebar(),
    },
    { separator: true },
    process.env.REACT_APP_ENV == "development"
      ? {
          label: "Testing",
          icon: "pi pi-check-circle",
          items: [
            {
              label: "Faker",
              icon: "pi pi-bullseye",
              command: (e) => {
                setShowFakerDialog(true);
              },
              show: true,
            },
            {
              label: `Drop ${data?.length}`,
              icon: "pi pi-trash",
              command: (e) => {
                setShowDeleteAllDialog(true);
              },
            },
          ],
        }
      : null,
    permissions.seeder
      ? {
          label: "Data seeder",
          icon: "pi pi-database",
          command: (e) => {
            setShowSeederDialog(true);
          },
        }
      : null,
  ].filter(Boolean);

  const onMenuSort = (field, order) => {
    let sortedData;
    if (field.includes(".")) {
      sortedData = _.orderBy(data, [(item) => _.get(item, field, "")], [order]);
    } else {
      sortedData = _.orderBy(data, [field], [order]);
    }
    setData(sortedData);
    setActiveSort(`${field}-${order}`);
  };

  const filterMenuItems = [
    {
      label: `Filter`,
      icon: "pi pi-filter",
      command: () => setShowFilter(true),
    },
    {
      label: `Clear`,
      icon: "pi pi-filter-slash",
      command: () => setSelectedFilterFields([]),
    },
  ];

  const sortMenuItems = [
    {
      label: "Sort by",
      template: (item) => (
        <div
          style={{
            fontWeight: "bold",
            padding: "8px 16px",
            backgroundColor: "#f8f9fa",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {item.label}
        </div>
      ),
      command: () => {},
    },
    { separator: true },
    ...fields.flatMap((field) => [
      {
        label: `${field.name} (Ascending)`,
        icon: activeSort === `${field.value}-asc` ? "pi pi-check" : null,
        command: () => onMenuSort(field.value, "asc"),
        template: (item) => (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              color: activeSort === `${field.value}-asc` ? "#007bff" : "#333",
              backgroundColor:
                activeSort === `${field.value}-asc` ? "#e6f3ff" : "transparent",
            }}
          >
            {item.icon && (
              <i
                className={item.icon}
                style={{ marginRight: "8px", color: "#007bff" }}
              />
            )}
            {item.label}
          </div>
        ),
      },
      {
        label: `${field.name} (Descending)`,
        icon: activeSort === `${field.value}-desc` ? "pi pi-check" : null,
        command: () => onMenuSort(field.value, "desc"),
        template: (item) => (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              color: activeSort === `${field.value}-desc` ? "#007bff" : "#333",
              backgroundColor:
                activeSort === `${field.value}-desc`
                  ? "#e6f3ff"
                  : "transparent",
            }}
          >
            {item.icon && (
              <i
                className={item.icon}
                style={{ marginRight: "8px", color: "#007bff" }}
              />
            )}
            {item.label}
          </div>
        ),
      },
    ]),
    { separator: true },
    {
      label: "Reset",
      icon: "pi pi-refresh",
      command: () => {
        setData(_.cloneDeep(initialData));
        setActiveSort(null);
      },
      template: (item) => (
        <div
          style={{
            color: "#d30000",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            padding: "8px 16px",
            fontSize: "13px",
          }}
        >
          <i className={item.icon} style={{ marginRight: "8px" }} />
          {item.label}
        </div>
      ),
    },
  ];

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    const tabId = getOrSetTabId();
    const response = await props.get();
    const currentCache = response?.results;
    const selectedUser =
      localStorage.getItem(`selectedUser_${tabId}`) ||
      currentCache?.selectedUser;
    setSelectedUser(selectedUser);

    if (currentCache && selectedUser) {
      const selectedUserProfile = currentCache.profiles.find(
        (profile) => profile.profileId === selectedUser,
      );

      if (selectedUserProfile) {
        const paginatorRecordsNo = _.get(
          selectedUserProfile,
          "preferences.settings.companies.paginatorRecordsNo",
          10,
        );
        setPaginatorRecordsNo(paginatorRecordsNo);

        return;
      }
    }
    try {
      const profileResponse = await client
        .service("profiles")
        .get(selectedUser, {
          query: { $populate: ["position"] },
        });

      const paginatorRecordsNo = _.get(
        profileResponse,
        "preferences.settings.companies.paginatorRecordsNo",
        10,
      );
      setPaginatorRecordsNo(paginatorRecordsNo);
    } catch (error) {
      console.error("Error fetching profile from profiles service:", error);
    }
  };

  useEffect(() => {
    const updateCache = async () => {
      const tabId = getOrSetTabId();
      const response = await props.get();
      const currentCache = response?.results;
      const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
      setSelectedUser(selectedUser || currentCache.selectedUser);

      if (currentCache && selectedUser) {
        const selectedUserProfileIndex = currentCache.profiles.findIndex(
          (profile) => profile.profileId === selectedUser,
        );

        if (selectedUserProfileIndex !== -1) {
          _.set(
            currentCache.profiles[selectedUserProfileIndex],
            "preferences.settings.companies.paginatorRecordsNo",
            paginatorRecordsNo,
          );

          props.set(currentCache);
        } else {
          console.warn("Selected user profile not found in cache.");
        }
      } else {
        console.warn("Cache or selectedUser is not available.");
      }
    };
    updateCache();
  }, [paginatorRecordsNo, selectedUser]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (selectedUser) {
          const profile = await client.service("profiles").get(selectedUser);
          const companyPermissions = await client
            .service("permissionServices")
            .find({
              query: { service: "companies" },
            });

          let userPermissions = null;

          // Priority 1: Profile
          userPermissions = companyPermissions.data.find(
            (perm) => perm.profile === profile._id,
          );

          // Priority 2: Position
          if (!userPermissions) {
            userPermissions = companyPermissions.data.find(
              (perm) => perm.positionId === profile.position,
            );
          }

          // Priority 3: Role
          if (!userPermissions) {
            userPermissions = companyPermissions.data.find(
              (perm) => perm.roleId === profile.role,
            );
          }

          if (userPermissions) {
            setPermissions(userPermissions);
          } else {
            console.debug("No permissions found for this user and service.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      }
    };

    if (selectedUser) {
      fetchPermissions();
    }
  }, [selectedUser]);

  return (
    <div className="mt-5">
      <div className="grid">
        <div className="col-6 flex align-items-center justify-content-start">
          <h4 className="mb-0 ml-2">
            <span> Company / </span>
            <strong>Companies </strong>
          </h4>
          {permissions.read ? (
            <SplitButton
              model={menuItems.filter(
                (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
              )}
              dropdownIcon="pi pi-ellipsis-h"
              buttonClassName="hidden"
              menuButtonClassName="ml-1 p-button-text"
            />
          ) : null}
        </div>
        <div className="col-6 flex justify-content-end">
          <>
            <FavouriteService
              favouriteItem={favouriteItem}
              serviceName="companies"
            />{" "}
            <SplitButton
              model={filterMenuItems.filter(
                (m) => !(m.icon === "pi pi-trash" && data?.length === 0),
              )}
              dropdownIcon={
                <img
                  src={FilterIcon}
                  style={{ marginRight: "4px", width: "1em", height: "1em" }}
                />
              }
              buttonClassName="hidden"
              menuButtonClassName="ml-1 p-button-text"
              // menuStyle={{ width: "250px" }}
            ></SplitButton>
            <SplitButton
              model={sortMenuItems.filter(
                (m) => !(m.icon === "pi pi-trash" && data?.length === 0),
              )}
              dropdownIcon={
                <img
                  src={SortIcon}
                  style={{ marginRight: "8px", width: "1em", height: "1em" }}
                />
              }
              buttonClassName="hidden"
              menuButtonClassName="ml-1 p-button-text"
              menuStyle={{ width: "200px" }}
            ></SplitButton>
            {permissions.create ? (
              <Button
                label="add"
                style={{ height: "30px", marginRight: "10px" }}
                rounded
                loading={loading}
                icon="pi pi-plus"
                onClick={() => setShowCreateDialog(true)}
                role="companies-add-button"
              />
            ) : null}
          </>
        </div>
      </div>
      <div className="grid align-items-center">
        <div className="col-12" role="companies-datatable">
          <CompaniesDatatable
            items={data}
            fields={fields}
            onRowDelete={onRowDelete}
            onEditRow={onEditRow}
            onRowClick={onRowClick}
            searchDialog={searchDialog}
            setSearchDialog={setSearchDialog}
            showUpload={showUpload}
            setShowUpload={setShowUpload}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
            showColumns={showColumns}
            setShowColumns={setShowColumns}
            onClickSaveFilteredfields={onClickSaveFilteredfields}
            selectedFilterFields={selectedFilterFields}
            setSelectedFilterFields={setSelectedFilterFields}
            selectedHideFields={selectedHideFields}
            setSelectedHideFields={setSelectedHideFields}
            onClickSaveHiddenfields={onClickSaveHiddenfields}
            loading={loading}
            user={props.user}
            selectedDelete={selectedDelete}
            setSelectedDelete={setSelectedDelete}
            onCreateResult={onCreateResult}
            setRefresh={setRefresh}
            selectedUser={selectedUser}
            setPaginatorRecordsNo={setPaginatorRecordsNo}
            paginatorRecordsNo={paginatorRecordsNo}
          />
        </div>
      </div>
      <DownloadCSV
        data={data}
        fileName={filename}
        triggerDownload={triggerDownload}
        setTriggerDownload={setTriggerDownload}
      />
      <AreYouSureDialog
        header="Delete"
        body="Are you sure you want to delete this record?"
        show={showAreYouSureDialog}
        onHide={() => setShowAreYouSureDialog(false)}
        onYes={() => deleteRow()}
      />
      <CompaniesEditDialogComponent
        entity={_.find(data, { _id: selectedEntityIndex })}
        show={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        onEditResult={onEditResult}
      />
      <CompaniesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
      />
      <CompaniesFakerDialogComponent
        show={showFakerDialog}
        onHide={() => setShowFakerDialog(false)}
        onFakerCreateResults={onFakerCreateResults}
      />
      <CompaniesSeederDialogComponent
        show={showSeederDialog}
        onHide={() => setShowSeederDialog(false)}
        onSeederResults={onSeederResults}
      />
      <AreYouSureDialog
        header={`Drop ${data?.length} records`}
        body={`Are you sure you want to drop ${data?.length} records?`}
        show={showDeleteAllDialog}
        onHide={() => setShowDeleteAllDialog(false)}
        onYes={() => deleteAll()}
        loading={loading}
      />
      <HelpbarService
        isVisible={isHelpSidebarVisible}
        onToggle={toggleHelpSidebar}
        serviceName="companies"
      />
    </div>
  );
};
const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  const { cache } = state.cache;
  return { user, isLoggedIn, cache };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
  show: () => dispatch.loading.show(),
  hide: () => dispatch.loading.hide(),
  get: () => dispatch.cache.get(),
  set: (data) => dispatch.cache.set(data),
});

export default connect(mapState, mapDispatch)(CompaniesPage);
