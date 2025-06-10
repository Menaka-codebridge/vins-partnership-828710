import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import moment from "moment";
import UploadService from "../../../services/UploadService";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import DownloadCSV from "../../../utils/DownloadCSV";
import InboxCreateDialogComponent from "../../cb_components/InboxPage/InboxCreateDialogComponent";
import InviteIcon from "../../../assets/media/Invite.png";
import ExportIcon from "../../../assets/media/Export & Share.png";
import CopyIcon from "../../../assets/media/Clipboard.png";
import DuplicateIcon from "../../../assets/media/Duplicate.png";
import DeleteIcon from "../../../assets/media/Trash.png";
import { Toast } from "primereact/toast";
import DeleteImage from "../../../assets/media/Delete.png";
import client from "../../../services/restClient";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from 'primereact/skeleton';

const UsersDataTable = ({
  items,
  fields,
  onEditRow,
  onRowDelete,
  onRowClick,
  searchDialog,
  setSearchDialog,
  showUpload,
  setShowUpload,
  showFilter,
  setShowFilter,
  showColumns,
  setShowColumns,
  onClickSaveFilteredfields,
  selectedFilterFields,
  setSelectedFilterFields,
  selectedHideFields,
  setSelectedHideFields,
  onClickSaveHiddenfields,
  loading,
  user,
  selectedDelete,
  setSelectedDelete,
  onCreateResult,
  setRefresh,
  selectedUser,
  setPaginatorRecordsNo,
  paginatorRecordsNo,
}) => {
  const dt = useRef(null);
  const urlParams = useParams();
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [data, setData] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [fieldPermissions, setFieldPermissions] = useState({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  const header = (
    <div
      className="table-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h5 className="m-0"></h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Keyword Search"
        />
      </span>
    </div>
  );

  const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.name}</p>;
  const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.email}</p>;
  const p_booleanTemplate3 = (rowData, { rowIndex }) => (
    <p>{String(rowData.status)}</p>
  );
  const editTemplate = (rowData, { rowIndex }) => (
    <Button
      onClick={() => onEditRow(rowData, rowIndex)}
      icon={`pi ${rowData.isEdit ? "pi-check" : "pi-pencil"}`}
      className={`p-button-rounded p-button-text ${rowData.isEdit ? "p-button-success" : "p-button-warning"}`}
    />
  );
  const deleteTemplate = (rowData, { rowIndex }) => (
    <Button
      onClick={() => onRowDelete(rowData._id)}
      icon="pi pi-trash"
      className="p-button-rounded p-button-danger p-button-text"
    />
  );
  const pCreatedAt = (rowData, { rowIndex }) => (
    <p>{moment(rowData.createdAt).fromNow()}</p>
  );
  const pUpdatedAt = (rowData, { rowIndex }) => (
    <p>{moment(rowData.updatedAt).fromNow()}</p>
  );
  const checkboxTemplate = (rowData) => (
    <Checkbox
      checked={selectedItems.some((item) => item._id === rowData._id)}
      onChange={(e) => {
        let _selectedItems = [...selectedItems];

        if (e.checked) {
          _selectedItems.push(rowData);
        } else {
          _selectedItems = _selectedItems.filter(
            (item) => item._id !== rowData._id,
          );
        }
        setSelectedItems(_selectedItems);
      }}
    />
  );

  const template1 = {
    layout:
      "RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink JumpToPageInput NextPageLink LastPageLink",
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 20, value: 20 },
        { label: 120, value: 120 },
      ];

      return (
        <React.Fragment>
          <div>
            <Dropdown
              value={paginatorRecordsNo}
              options={dropdownOptions}
              onChange={(e) => {
                options.onChange(e);
                setPaginatorRecordsNo(e.value);
              }}
            />
            <span
              className="mr-3 ml-2"
              style={{ color: "var(--text-color)", userSelect: "none" }}
            >
              items per page
            </span>
            <span style={{ width: "10px" }}></span>
          </div>
        </React.Fragment>
      );
    },
    CurrentPageReport: (options) => {
      return (
        <div className=" mr-20">
          <span style={{ color: "grey", userSelect: "none" }}>
            <span className="mr-3 ml-2">|</span>
            <span className="mr-20">
              {options.first} - {options.last} of {options.totalRecords}{" "}
              items{" "}
            </span>
          </span>
        </div>
      );
    },
    JumpToPageInput: (options) => {
      console.log("option", options);

      return (
        <div>
          <span>Page</span>
          {options.element}
          <span>of {options.props.totalPages}</span>
        </div>
      );
    },
  };

  const deselectAllRows = () => {
    // Logic to deselect all selected rows
    setSelectedItems([]); // Assuming setSelectedItems is used to manage selected items state
  };

  const handleDelete = async () => {
    if (!selectedItems || selectedItems.length === 0) return;
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const promises = selectedItems.map((item) =>
        client.service("users").remove(item._id),
      );
      await Promise.all(promises);
      const updatedData = data.filter(
        (item) => !selectedItems.find((selected) => selected._id === item._id),
      );
      setData(updatedData);
      setSelectedDelete(selectedItems.map((item) => item._id));
      deselectAllRows();
      setShowDeleteConfirmation(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Failed to delete selected records", error);
      setShowDeleteConfirmation(false);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        if (selectedUser) {
          const profile = await client.service("profiles").get(selectedUser);
          const usersPermissions = await client
            .service("permissionServices")
            .find({
              query: { service: "users" },
            });

          let userPermissions = null;

          // Priority 1: Profile
          userPermissions = usersPermissions.data.find(
            (perm) => perm.profile === profile._id,
          );

          // Priority 2: Position
          if (!userPermissions) {
            userPermissions = usersPermissions.data.find(
              (perm) => perm.positionId === profile.position,
            );
          }

          // Priority 3: Role
          if (!userPermissions) {
            userPermissions = usersPermissions.data.find(
              (perm) => perm.roleId === profile.role,
            );
          }

          if (userPermissions) {
            setPermissions(userPermissions);
          } else {
            console.log("No permissions found for this user and service.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    if (selectedUser) {
      fetchPermissions();
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchFieldPermissions = async () => {
      try {
        const userPermissions = await client.service("permissionFields").find();
        const filteredPermissions = userPermissions.data.filter(
          (perm) =>
            perm.servicePermissionId.roleId === selectedUser &&
            perm.service === "users",
        );
        if (filteredPermissions.length > 0) {
          setFieldPermissions(filteredPermissions[0]);
        }
        console.log("FieldPermissions", fieldPermissions);
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      }
    };

    fetchFieldPermissions();
    if (selectedUser) {
      fetchFieldPermissions();
    }
  }, [selectedUser]);

  const handleMessage = () => {
    setShowDialog(true);
  };

  const handleHideDialog = () => {
    setShowDialog(false);
  };
  const toast = useRef(null);

  const handleCopy = async () => {
    if (!selectedItems || selectedItems.length === 0) return;

    try {
      const dataToCopy = selectedItems.map((item) =>
        _.omit(item, ["_id", "createdAt", "updatedAt"]),
      );
      await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
      toast.current.show({
        severity: "success",
        summary: "Copied",
        detail: `users data copied to clipboard`,
        life: 3000,
      });
      deselectAllRows();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to copy to clipboard",
        life: 3000,
      });
    }
  };

  const handleDuplicate = async () => {
    if (!selectedItems || selectedItems.length === 0) return;

    try {
      const promises = selectedItems.map((item) => {
        const newItem = _.omit(item, ["_id", "createdAt", "updatedAt"]);
        newItem.createdBy = user._id;
        newItem.updatedBy = user._id;
        return client.service("users").create(newItem);
      });
      const createdItems = await Promise.all(promises);
      toast.current.show({
        severity: "success",
        summary: "Duplicated",
        detail: `${selectedItems.length} users duplicated successfully`,
        life: 3000,
      });
      deselectAllRows();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Failed to duplicate users", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to duplicate users",
        life: 3000,
      });
    }
  };

  const handleExport = () => {
    if (!items || items.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "No data available to export",
        life: 3000,
      });
      return;
    }

    const dataToExport = selectedItems.length > 0 ? selectedItems : items;
    setTriggerDownload(true);

    toast.current.show({
      severity: "success",
      summary: "Exported",
      detail: `${dataToExport.length} items exported successfully`,
      life: 3000,
    });
  };

  const renderSkeleton = () => {
    return (
      <DataTable value={Array.from({ length: 5 })} className="p-datatable-striped">
        <Column body={<Skeleton />} />
        <Column body={<Skeleton />} />
        <Column body={<Skeleton />} />
        <Column body={<Skeleton />} />
        <Column body={<Skeleton />} />
      </DataTable>
    );
  };

  return (
    <>
      {isLoadingPermissions ? (
        renderSkeleton()
      ) : permissions.read ? (
        <>
          <DataTable
            value={items}
            ref={dt}
            removableSort
            onRowClick={onRowClick}
            scrollable
            rowHover
            stripedRows
            paginator
            rows={paginatorRecordsNo}
            rowsPerPageOptions={[10, 50, 250, 500]}
            paginatorTemplate={template1}
            rowClassName="cursor-pointer"
            alwaysShowPaginator={!urlParams.singleUsersId}
            selection={selectedItems}
            onSelectionChange={(e) => setSelectedItems(e.value)}
            onCreateResult={onCreateResult}
            globalFilter={globalFilter}
            header={header}
            user={user}
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
              body={checkboxTemplate}
            />
            <Column
              field="name"
              header="Name"
              body={pTemplate0}
              filter={selectedFilterFields.includes("name")}
              hidden={selectedHideFields?.includes("name")}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="email"
              header="Email"
              body={pTemplate1}
              filter={selectedFilterFields.includes("email")}
              hidden={selectedHideFields?.includes("email")}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="status"
              header="Status"
              body={p_booleanTemplate3}
              filter={selectedFilterFields.includes("status")}
              hidden={selectedHideFields?.includes("status")}
              style={{ minWidth: "8rem" }}
            />
            {permissions.update ? (
              <Column header="Edit" body={editTemplate} />
            ) : null}
            {permissions.delete ? (
              <Column header="Delete" body={deleteTemplate} />
            ) : null}
          </DataTable>
          {selectedItems.length > 0 ? (
            <div
              className="card center"
              style={{
                position: "fixed",
                bottom: "20px",
                left: 200,
                right: 0,
                margin: "0 auto",
                width: "51rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                fontSize: "14px",
                fontFamily: "Arial, sans-serif",
                color: "#2A4454",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #2A4454",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                {selectedItems.length} selected
                <span
                  className="pi pi-times"
                  style={{
                    cursor: "pointer",
                    marginLeft: "10px",
                    color: "#2A4454",
                  }}
                  onClick={() => {
                    deselectAllRows();
                  }}
                />
              </div>

              {/* New buttons section */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Copy button */}
                <Button
                  label="Copy"
                  labelposition="right"
                  icon={
                    <img
                      src={CopyIcon}
                      style={{
                        marginRight: "4px",
                        width: "1em",
                        height: "1em",
                      }}
                    />
                  }
                  // tooltip="Copy"
                  onClick={handleCopy}
                  className="p-button-rounded p-button-text"
                  style={{
                    backgroundColor: "white",
                    color: "#2A4454",
                    border: "1px solid transparent",
                    transition: "border-color 0.3s",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    marginRight: "8px",
                    gap: "4px",
                  }}
                />

                {/* Duplicate button */}
                <Button
                  label="Duplicate"
                  labelposition="right"
                  icon={
                    <img
                      src={DuplicateIcon}
                      style={{
                        marginRight: "4px",
                        width: "1em",
                        height: "1em",
                      }}
                    />
                  }
                  // tooltip="Duplicate"
                  onClick={handleDuplicate}
                  className="p-button-rounded p-button-text"
                  style={{
                    backgroundColor: "white",
                    color: "#2A4454",
                    border: "1px solid transparent",
                    transition: "border-color 0.3s",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    marginRight: "8px",
                    gap: "4px",
                  }}
                />

                {/* Export button */}
                <Button
                  label="Export"
                  labelposition="right"
                  icon={
                    <img
                      src={ExportIcon}
                      style={{
                        marginRight: "4px",
                        width: "1em",
                        height: "1em",
                      }}
                    />
                  }
                  onClick={handleExport}
                  className="p-button-rounded p-button-text"
                  style={{
                    backgroundColor: "white",
                    color: "#2A4454",
                    border: "1px solid transparent",
                    transition: "border-color 0.3s",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    marginRight: "8px",
                    gap: "4px",
                  }}
                />

                {/* Message button */}
                <Button
                  label="Message"
                  labelposition="right"
                  icon={
                    <img
                      src={InviteIcon}
                      style={{
                        marginRight: "4px",
                        width: "1em",
                        height: "1em",
                      }}
                    />
                  }
                  onClick={handleMessage}
                  className="p-button-rounded p-button-text"
                  style={{
                    backgroundColor: "white",
                    color: "#2A4454",
                    border: "1px solid transparent",
                    transition: "border-color 0.3s",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    marginRight: "8px",
                    gap: "4px",
                  }}
                />

                {/* InboxCreateDialogComponent */}
                <InboxCreateDialogComponent
                  show={showDialog}
                  onHide={handleHideDialog}
                  serviceInbox="users"
                  onCreateResult={onCreateResult}
                  // selectedItemsId={selectedItems.map(item => item._id)}
                  selectedItemsId={selectedItems}
                />

                {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                <Button
                  label="Delete"
                  labelposition="right"
                  icon={
                    <img
                      src={DeleteIcon}
                      style={{
                        marginRight: "4px",
                        width: "1em",
                        height: "1em",
                      }}
                    />
                  }
                  onClick={handleDelete}
                  style={{
                    backgroundColor: "white",
                    color: "#2A4454",
                    border: "1px solid transparent",
                    transition: "border-color 0.3s",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    gap: "4px",
                  }}
                />
              </div>
            </div>
          ) : null}

          <Dialog
            header="Upload Users Data"
            visible={showUpload}
            onHide={() => setShowUpload(false)}
          >
            <UploadService
              user={user}
              serviceName="users"
              onUploadComplete={() => {
                setShowUpload(false); // Close the dialog after upload
              }}
              disabled={true}
            />
          </Dialog>
          <Dialog
            header="Search Users"
            visible={searchDialog}
            onHide={() => setSearchDialog(false)}
          >
            SearchService
          </Dialog>
          <Dialog
            header="Filter Users"
            visible={showFilter}
            onHide={() => setShowFilter(false)}
          >
            <div className="card flex justify-content-center">
              <MultiSelect
                value={selectedFilterFields}
                onChange={(e) => setSelectedFilterFields(e.value)}
                options={fields}
                optionLabel="name"
                optionValue="value"
                filter
                placeholder="Select Fields"
                maxSelectedLabels={6}
                className="w-full md:w-20rem"
              />
            </div>
            <Button
              text
              label="save"
              onClick={() => {
                console.debug(selectedFilterFields);
                onClickSaveFilteredfields(selectedFilterFields);
                setSelectedFilterFields(selectedFilterFields);
                setShowFilter(false);
              }}
            ></Button>
          </Dialog>

          <Dialog
            header="Hide Columns"
            visible={showColumns}
            onHide={() => setShowColumns(false)}
          >
            <div className="card flex justify-content-center">
              <MultiSelect
                value={selectedHideFields}
                onChange={(e) => setSelectedHideFields(e.value)}
                options={fields}
                optionLabel="name"
                optionValue="value"
                filter
                placeholder="Select Fields"
                maxSelectedLabels={6}
                className="w-full md:w-20rem"
              />
            </div>
            <Button
              text
              label="save"
              onClick={() => {
                console.debug(selectedHideFields);
                onClickSaveHiddenfields(selectedHideFields);
                setSelectedHideFields(selectedHideFields);
                setShowColumns(false);
              }}
            ></Button>
          </Dialog>
          <Toast ref={toast} />
          <Dialog
            visible={showDeleteConfirmation}
            onHide={() => setShowDeleteConfirmation(false)}
            footer={
              <div
                className="flex justify-content-center"
                style={{ padding: "1rem" }}
              >
                <Button
                  label="Cancel"
                  onClick={() => setShowDeleteConfirmation(false)}
                  rounded
                  className="p-button-rounded p-button-secondary ml-2"
                  style={{
                    color: "#D30000",
                    borderColor: "#D30000",
                    backgroundColor: "white",
                    width: "200px",
                    marginRight: "2rem",
                  }}
                />
                <Button
                  label="Delete"
                  onClick={confirmDelete}
                  className="no-focus-effect"
                  rounded
                  style={{ width: "200px" }}
                />
              </div>
            }
          >
            <div className="flex flex-column align-items-center">
              <img
                src={DeleteImage}
                alt="Delete Icon"
                style={{
                  width: "150px",
                  height: "150px",
                  marginBottom: "10px",
                }}
              />
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2em",
                  marginBottom: "10px",
                }}
              >
                Delete listing?
              </span>
              <p style={{ marginBottom: "10px" }}>
                This action cannot be undone, and all data will be deleted
                permanently.
              </p>
            </div>
          </Dialog>

          <DownloadCSV
            data={items}
            fileName="users"
            triggerDownload={triggerDownload}
            setTriggerDownload={setTriggerDownload}
            selectedData={selectedItems}
          />
        </>
      ) : (
        <p>You do not have permission to view this data.</p>
      )}
    </>
  );
};
export default UsersDataTable;
