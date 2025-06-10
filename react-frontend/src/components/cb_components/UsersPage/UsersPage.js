import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import client from "../../../services/restClient";
import axios from "axios";
import _ from "lodash";
import entityCreate from "../../../utils/entity";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
import DownloadCSV from "../../../utils/DownloadCSV";
import AreYouSureDialog from "../../common/AreYouSureDialog";
import UsersDatatable from "./UsersDataTable";
import UsersEditDialogComponent from "./UsersEditDialogComponent";
import UsersCreateDialogComponent from "./UsersCreateDialogComponent";
import UsersFakerDialogComponent from "./UsersFakerDialogComponent";
import UsersSeederDialogComponent from "./UsersSeederDialogComponent";
import SortIcon from "../../../assets/media/Sort.png";
import FilterIcon from "../../../assets/media/Filter.png";
import FavouriteService from "../../../services/FavouriteService";
import { v4 as uuidv4 } from "uuid";
import HelpbarService from "../../../services/HelpbarService";


const UsersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [showAreYouSureDialog, setShowAreYouSureDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRecord, setRecord] = useState({});
  const [showFakerDialog, setShowFakerDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showSeederDialog, setShowSeederDialog] = useState(false);
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilterFields, setSelectedFilterFields] = useState([]);
  const [selectedHideFields, setSelectedHideFields] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const urlParams = useParams();
  const filename = "users";
const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedDelete, setSelectedDelete] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [permissions, setPermissions] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [paginatorRecordsNo, setPaginatorRecordsNo] = useState(10);
  const [triggerDownload, setTriggerDownload] = useState(false);

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
  
  

  const favouriteItem = {
    icon: "pi pi-users",
    label: "users",
    url: "/users",
    mainMenu: "users",
  };
const toggleHelpSidebar = () => {
    setHelpSidebarVisible(!isHelpSidebarVisible);
  };

  useEffect(() => {
    const _getSchema = async () => {
      const _schema = await props.getSchema("users");
      let _fields = _schema.data.map((field, i) => i > 5 && field.field);
      setSelectedHideFields(_fields);
      _fields = _schema.data.map((field, i) => {
        return {
          name: field.field,
          value: field.field,
          type: field?.properties?.type,
        };
      });
      setFields(_fields);
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
    client
      .service("users")
      .find({ query: { $limit: 10000, $sort: { name: 1 } } })
      .then((res) => {
        let results = res.data;

        setData(results);
        setInitialData(results);
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Users",
          type: "error",
          message: error.message || "Failed get Users",
        });
      });
  }, [showFakerDialog, showDeleteAllDialog,showEditDialog, showCreateDialog, refresh,]);

  const onClickSaveFilteredfields = (ff) => {
    console.debug(ff);
  };

  const onClickSaveHiddenfields = (ff) => {
    console.debug(ff);
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
    console.debug(newEntity);
    let _newData = _.cloneDeep(data);
    _.set(_newData, { _id: selectedEntityIndex }, newEntity);
    setData(_newData);
  };

  const deleteRow = async () => {
    try {
      await client.service("users").remove(selectedEntityIndex);
      let _newData = data.filter((data) => data._id !== selectedEntityIndex);
      setData(_newData);
      setSelectedEntityIndex();
      setShowAreYouSureDialog(false);
    } catch (error) {
      console.debug({ error });
      props.alert({
        title: "Users",
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
    if (process.env.REACT_APP_ENV !== "development") {
      props.alert({
        title: "Delete is disabled for non-dev envs",
        type: "error",
        message: "Delete is not recommended.",
      });
      return;
    }

    setShowDeleteAllDialog(false);
    const countDataItems = data?.length;
    const promises = data.map((e) => client.service("users").remove(e._id));
    await Promise.all(
      promises.map((p) =>
        p.catch((error) => {
          props.alert({
            title: "Users",
            type: "error",
            message: error.message || "Failed to delete all records",
          });
          console.debug({ error });
        }),
      ),
    );
    await props.alert({
      title: "Users",
      type: "warn",
      message: `Successfully dropped ${countDataItems} records`,
    });
  };

  const onRowClick = ({ data }) => {
    props.setOneUser(data._id);
    navigate(`/users/${data._id}`);
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

  const onMenuSort = (sortOption) => {
    let sortedData;
    switch (sortOption) {
      case "nameAsc":
        sortedData = _.orderBy(data, ["name"], ["asc"]);
        break;
      case "nameDesc":
        sortedData = _.orderBy(data, ["name"], ["desc"]);
        break;
      case "createdAtAsc":
        sortedData = _.orderBy(data, ["createdAt"], ["asc"]);
        break;
      case "createdAtDesc":
        sortedData = _.orderBy(data, ["createdAt"], ["desc"]);
        break;
      default:
        sortedData = data;
    }
    setData(sortedData);
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
            backgroundColor: "#ffffff",
            fontSize: "16px",
          }}
        >
          {item.label}
        </div>
      ),
      command: () => {},
    },
    { separator: true },
    { label: "Name Ascending", command: () => onMenuSort("nameAsc") },
    { label: "Name Descending", command: () => onMenuSort("nameDesc") },
    {
      label: "Created At Ascending",
      command: () => onMenuSort("createdAtAsc"),
    },
    {
      label: "Created At Descending",
      command: () => onMenuSort("createdAtDesc"),
    },
    {
      label: "Reset",
      command: () => setData(_.cloneDeep(initialData)), // Reset to original data if you want
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
    const selectedUser = localStorage.getItem(`selectedUser_${tabId}`) || currentCache?.selectedUser;
    setSelectedUser(selectedUser);

    if (currentCache && selectedUser) {
      const selectedUserProfile = currentCache.profiles.find(
        (profile) => profile.profileId === selectedUser,
      );

      if (selectedUserProfile) {
        const paginatorRecordsNo = _.get(
          selectedUserProfile,
          "preferences.settings.users.paginatorRecordsNo",
          10,
        );
        setPaginatorRecordsNo(paginatorRecordsNo);
        console.log("PaginatorRecordsNo from cache:", paginatorRecordsNo);
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
        "preferences.settings.users.paginatorRecordsNo",
        10,
      );
      setPaginatorRecordsNo(paginatorRecordsNo);
      console.log("PaginatorRecordsNo from service:", paginatorRecordsNo);
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
            "preferences.settings.users.paginatorRecordsNo",
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
              query: { service: "users" },
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
            console.log("userPermissions", userPermissions);
          } else {
            console.log("No permissions found for this user and service.");
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
        <div className="col-6 flex justify-content-start">
          <h4 className="mb-0 ml-2">
            <span>
              {" "}
              <small>Users</small> /{" "}
            </span>
            <strong>User Lists </strong>
          </h4>
          {permissions.read ? (
          <SplitButton
            model={menuItems.filter(
              (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
            )}
            dropdownIcon="pi pi-ellipsis-h"
            buttonClassName="hidden"
            menuButtonClassName="ml-1 p-button-text"
          />   ) : null}
        </div>
        <div className="col-6 flex justify-content-end">
          <>
            <FavouriteService
              favouriteItem={favouriteItem}
              serviceName="users"
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
                  style={{ marginRight: "4px", width: "1em", height: "1em" }}
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
              role="steps-add-button"
            />  ) : null}
          </>
        </div>
      </div>
      <div className="grid align-items-center">
        <div className="col-12" role="users-datatable">
          <UsersDatatable
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
      <UsersEditDialogComponent
        entity={_.find(data, { _id: selectedEntityIndex })}
        show={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        onEditResult={onEditResult}
      />
      <UsersCreateDialogComponent
        entity={newRecord}
        show={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        onCreateResult={onCreateResult}
      />
      <UsersFakerDialogComponent
        show={showFakerDialog}
        onHide={() => setShowFakerDialog(false)}
        onFakerCreateResults={onFakerCreateResults}
      />
      <UsersSeederDialogComponent
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
      />
        <HelpbarService isVisible={isHelpSidebarVisible} onToggle={toggleHelpSidebar} serviceName="users" />
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
  setOneUser: (id) => dispatch.user.setOneUser(id),
  getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
  show: () => dispatch.loading.show(),
  hide: () => dispatch.loading.hide(),
  get: () => dispatch.cache.get(),
  set: (data) => dispatch.cache.set(data),
});

export default connect(mapState, mapDispatch)(UsersPage);
