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
import UserAddressesDatatable from "./UserAddressesDataTable";
import UserAddressesEditDialogComponent from "./UserAddressesEditDialogComponent";
import UserAddressesCreateDialogComponent from "./UserAddressesCreateDialogComponent";
import UserAddressesFakerDialogComponent from "./UserAddressesFakerDialogComponent";
import UserAddressesSeederDialogComponent from "./UserAddressesSeederDialogComponent";
import SortMenu from "../../../services/SortMenu";
import FilterMenu from "../../../services/FilterMenu";

const UserAddressesPage = (props) => {
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
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilterFields, setSelectedFilterFields] = useState([]);
  const [selectedHideFields, setSelectedHideFields] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const urlParams = useParams();
  const filename = "userAddresses";
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedDelete, setSelectedDelete] = useState([]);

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

  useEffect(() => {
    const _getSchema = async () => {
      const _schema = await props.getSchema("userAddresses");
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
      .service("userAddresses")
      .find({
        query: {
          $limit: 10000,
          userId: urlParams.singleUsersId,
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
            {
              path: "userId",
              service: "users",
              select: ["name"],
            },
          ],
        },
      })
      .then((res) => {
        let results = res.data;

        setData(results);
        props.hide();
        setLoading(false);
      })
      .catch((error) => {
        console.debug({ error });
        setLoading(false);
        props.hide();
        props.alert({
          title: "User Addresses",
          type: "error",
          message: error.message || "Failed get User Addresses",
        });
      });
  }, [showFakerDialog, showDeleteAllDialog, showEditDialog, showCreateDialog]);

  const onClickSaveFilteredfields = (ff) => {
    setSelectedFilterFields(ff);
    setShowFilter(false);
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
    let _newData = _.cloneDeep(data);
    _.set(_newData, { _id: selectedEntityIndex }, newEntity);
    setData(_newData);
  };

  const deleteRow = async () => {
    try {
      await client.service("userAddresses").remove(selectedEntityIndex);
      let _newData = data.filter((data) => data._id !== selectedEntityIndex);
      setData(_newData);
      setSelectedEntityIndex();
      setShowAreYouSureDialog(false);
    } catch (error) {
      console.debug({ error });
      props.alert({
        title: "User Addresses",
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
    const promises = data.map((e) =>
      client.service("userAddresses").remove(e?._id),
    );
    await Promise.all(
      promises.map((p) =>
        p.catch((error) => {
          props.alert({
            title: "User Addresses",
            type: "error",
            message: error.message || "Failed to delete all records",
          });
          setLoading(false);
          props.hide();
          console.debug({ error });
        }),
      ),
    );
    props.hide();
    setLoading(false);
    setShowDeleteAllDialog(false);
    await props.alert({
      title: "User Addresses",
      type: "warn",
      message: `Successfully dropped ${countDataItems} records`,
    });
  };

  const onRowClick = ({ data }) => {
    navigate(`/userAddresses/${data._id}`);
  };

  const menuItems = [
    {
      label: "Copy link",
      icon: "pi pi-copy",
      command: () => copyPageLink(),
    },
    // {
    //     label: "Share",
    //     icon: "pi pi-share-alt",
    //     command: () => setSearchDialog(true)
    // },
    {
      label: "Import",
      icon: "pi pi-upload",
      command: () => setShowUpload(true),
    },
    {
      label: "Export",
      icon: "pi pi-download",
      command: () => {
        // Trigger the download by setting the triggerDownload state
        data.length > 0
          ? setTriggerDownload(true)
          : props.alert({
              title: "Export",
              type: "warn",
              message: "no data to export",
            });
      },
    },
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
      : {},
    {
      label: "Data seeder",
      icon: "pi pi-database",
      command: (e) => {
        setShowSeederDialog(true);
      },
    },
  ];

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

  return (
    <div className="mt-5">
      <div className="grid">
        <div className="col-6 flex align-items-center justify-content-start">
          <h4 className="mb-0 ml-2">
            <span> AIMS / </span>
            <strong>User Addresses </strong>
          </h4>
          <SplitButton
            model={menuItems.filter(
              (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
            )}
            dropdownIcon="pi pi-ellipsis-h"
            buttonClassName="hidden"
            menuButtonClassName="ml-1 p-button-text"
          />
        </div>
        <div className="col-6 flex justify-content-end">
          <>
            {" "}
            <FilterMenu
              fields={fields}
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              selectedFilterFields={selectedFilterFields}
              setSelectedFilterFields={setSelectedFilterFields}
              onClickSaveFilteredfields={onClickSaveFilteredfields}
            />
            <SortMenu
              fields={fields}
              data={data}
              setData={setData}
              initialData={initialData}
            />
            <Button
              label="add"
              style={{ height: "30px", marginRight: "10px" }}
              rounded
              loading={loading}
              icon="pi pi-plus"
              onClick={() => setShowCreateDialog(true)}
              role="userAddresses-add-button"
            />
          </>
        </div>
      </div>
      <div className="grid align-items-center">
        <div className="col-12" role="userAddresses-datatable">
          <UserAddressesDatatable
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
      <UserAddressesEditDialogComponent
        entity={_.find(data, { _id: selectedEntityIndex })}
        show={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        onEditResult={onEditResult}
      />
      <UserAddressesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
      />
      <UserAddressesFakerDialogComponent
        show={showFakerDialog}
        onHide={() => setShowFakerDialog(false)}
        onFakerCreateResults={onFakerCreateResults}
      />
      <UserAddressesSeederDialogComponent
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
      <div
        ref={helpSidebarRef}
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
    </div>
  );
};
const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
  show: () => dispatch.loading.show(),
  hide: () => dispatch.loading.hide(),
});

export default connect(mapState, mapDispatch)(UserAddressesPage);
