import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";
import client from "../../../services/restClient";
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
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import DeleteImage from "../../../assets/media/Delete.png";
import { connect } from "react-redux";
import { Skeleton } from "primereact/skeleton";
import { Checkbox } from "primereact/checkbox";
const AccidentCasesDataTable = ({
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
  setRefresh,
  user,
  selectedDelete,
  setSelectedDelete,
  onCreateResult,
}) => {
  const dt = useRef(null);
  const urlParams = useParams();
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [data, setData] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [fieldPermissions, setFieldPermissions] = useState({});
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [filters, setFilters] = useState({});

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
  const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.insuranceRef}</p>;
  const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.summonsNo}</p>;
  const pTemplate12 = (rowData, { rowIndex }) => (
    <p>{moment(rowData.updatedAt).fromNow()}</p>
  );
  const pTemplate10 = (rowData, { rowIndex }) => (
    <p>{rowData.vinsPartnershipReference}</p>
  );
  const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.court}</p>;
  const pTemplate3 = (rowData, { rowIndex }) => (
    <p>{rowData.plaintiffSolicitors}</p>
  );
  const pTemplate4 = (rowData, { rowIndex }) => <p>{rowData.plaintiff}</p>;
  const pTemplate5 = (rowData, { rowIndex }) => <p>{rowData.createdBy.name}</p>;
  const pTemplate6 = (rowData, { rowIndex }) => <p>{rowData.insured}</p>;
  const pTemplate7 = (rowData, { rowIndex }) => <p>{rowData.insuredVehicle}</p>;
  const p_calendarTemplate8 = (rowData, { rowIndex }) => (
    <p>{rowData.collisionDateTime}</p>
  );
  const pTemplate9 = (rowData, { rowIndex }) => <p>{rowData.claimStatus}</p>;
  const dropdownTemplate10 = (rowData, { rowIndex }) => (
    <p>{rowData.user?.name}</p>
  );
  const pTemplate11 = (rowData, { rowIndex }) => <p>{rowData.synonyms}</p>;
  // const pTemplate12 = (rowData, { rowIndex }) => <p>{rowData.parameters}</p>;
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
        client.service("accidentCases").remove(item._id),
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

  const handleMessage = () => {
    setShowDialog(true); // Open the dialog
  };

  const handleHideDialog = () => {
    setShowDialog(false); // Close the dialog
  };
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
        detail: `AccidentCases data copied to clipboard`,
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
        return client.service("accidentCases").create(newItem);
      });
      const createdItems = await Promise.all(promises);
      toast.current.show({
        severity: "success",
        summary: "Duplicated",
        detail: `${selectedItems.length} accidentCases duplicated successfully`,
        life: 3000,
      });
      deselectAllRows();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Failed to duplicate accidentCases", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to duplicate accidentCases",
        life: 3000,
      });
    }
  };
  const toast = useRef(null);

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
  // Initialize filters based on selectedFilterFields
  useEffect(() => {
    const initialFilters = {};
    selectedFilterFields.forEach((field) => {
      initialFilters[field] = {
        value: null,
        matchMode: "contains",
      };
    });
    setFilters(initialFilters);
  }, [selectedFilterFields]);

  const onFilter = (e) => {
    setFilters(e.filters);
  };

  const filterTemplate = (options) => {
    return (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value)}
        placeholder={`Filter ${options.field}`}
      />
    );
  };

  return (
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
        rows={10}
        rowsPerPageOptions={[10, 50, 250, 500]}
        size={"small"}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        rowClassName="cursor-pointer"
        alwaysShowPaginator={!urlParams.singleUsersId}
        selection={selectedItems}
        onSelectionChange={(e) => setSelectedItems(e.value)}
        onCreateResult={onCreateResult}
        globalFilter={globalFilter}
        header={header}
        filters={filters}
        onFilter={onFilter}
        filterDisplay="menu"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
          body={checkboxTemplate}
        />
        <Column
          field="insuranceRef"
          header="Insurance Ref"
          body={pTemplate0}
          filter={selectedFilterFields.includes("insuranceRef")}
          filterElement={filterTemplate}
          hidden={selectedHideFields?.includes("insuranceRef")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="vinsPartnershipReference"
          header="Vins Partnership Reference"
          body={pTemplate10}
          filter={selectedFilterFields.includes("vinsPartnershipReference")}
          filterElement={filterTemplate}
          hidden={selectedHideFields?.includes("vinsPartnershipReference")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="summonsNo"
          header="Summons No"
          body={pTemplate1}
          filter={selectedFilterFields.includes("summonsNo")}
          filterElement={filterTemplate}
          hidden={selectedHideFields?.includes("summonsNo")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="updatedAt"
          header="Updated At"
          body={pTemplate12}
          filter={selectedFilterFields.includes("updatedAt")}
          filterElement={filterTemplate}
          // hidden={selectedHideFields?.includes("updatedAt")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="createdBy"
          header="Created By"
          body={pTemplate5}
          filter={selectedFilterFields.includes("createdBy")}
          // hidden={selectedHideFields?.includes("createdBy")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        {/* <Column
          field="court"
          header="Court"
          body={pTemplate2}
          filter={selectedFilterFields.includes("court")}
          hidden={selectedHideFields?.includes("court")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="plaintiffSolicitors"
          header="Plaintiff Solicitors"
          body={pTemplate3}
          filter={selectedFilterFields.includes("plaintiffSolicitors")}
          hidden={selectedHideFields?.includes("plaintiffSolicitors")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="plaintiff"
          header="Plaintiff"
          body={pTemplate4}
          filter={selectedFilterFields.includes("plaintiff")}
          hidden={selectedHideFields?.includes("plaintiff")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="insuredDriver"
          header="Insured Driver"
          body={pTemplate5}
          filter={selectedFilterFields.includes("insuredDriver")}
          hidden={selectedHideFields?.includes("insuredDriver")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="insured"
          header="Insured"
          body={pTemplate6}
          filter={selectedFilterFields.includes("insured")}
          hidden={selectedHideFields?.includes("insured")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="insuredVehicle"
          header="Insured Vehicle"
          body={pTemplate7}
          filter={selectedFilterFields.includes("insuredVehicle")}
          hidden={selectedHideFields?.includes("insuredVehicle")}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column
          field="collisionDateTime"
          header="Collision Date Time"
          body={p_calendarTemplate8}
          filter={selectedFilterFields.includes("collisionDateTime")}
          hidden={selectedHideFields?.includes("collisionDateTime")}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column
          field="claimStatus"
          header="ClaimStatus"
          body={pTemplate9}
          filter={selectedFilterFields.includes("claimStatus")}
          hidden={selectedHideFields?.includes("claimStatus")}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column
          field="user"
          header="User"
          body={dropdownTemplate10}
          filter={selectedFilterFields.includes("user")}
          hidden={selectedHideFields?.includes("user")}
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column
          field="synonyms"
          header="Synonyms"
          body={pTemplate11}
          filter={selectedFilterFields.includes("synonyms")}
          hidden={selectedHideFields?.includes("synonyms")}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column
          field="parameters"
          header="Parameters"
          body={pTemplate12}
          filter={selectedFilterFields.includes("parameters")}
          hidden={selectedHideFields?.includes("parameters")}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
        {/* <Column header="Edit" body={editTemplate} /> */}
        <Column header="Delete" body={deleteTemplate} />
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

          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              label="Copy"
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
            <Button
              label="Duplicate"
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
            <Button
              label="Export"
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
            <Button
              label="Message"
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
            <InboxCreateDialogComponent
              show={showDialog}
              onHide={handleHideDialog}
              serviceInbox="accidentCases"
              onCreateResult={onCreateResult}
              selectedItemsId={selectedItems}
            />
            <Button
              label="Delete"
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
        header="Upload AccidentCases Data"
        visible={showUpload}
        onHide={() => setShowUpload(false)}
      >
        <UploadService
          user={user}
          serviceName="accidentCases"
          onUploadComplete={() => {
            setShowUpload(false); // Close the dialog after upload
          }}
        />
      </Dialog>

      <Dialog
        header="Search accidentCases"
        visible={searchDialog}
        onHide={() => setSearchDialog(false)}
      >
        Search
      </Dialog>
      <Dialog
        header="Filter AccidentCases"
        visible={showFilter}
        onHide={() => setShowFilter(false)}
        style={{ width: "30rem" }}
      >
        <div className="card flex flex-column gap-3">
          <MultiSelect
            value={selectedFilterFields}
            onChange={(e) => setSelectedFilterFields(e.value)}
            options={fields}
            optionLabel="name"
            optionValue="value"
            filter
            placeholder="Select Fields to Filter"
            maxSelectedLabels={3}
            className="w-full"
          />
          <Button
            label="Save"
            onClick={() => {
              onClickSaveFilteredfields(selectedFilterFields);
            }}
            className="w-full"
          />
        </div>
      </Dialog>

      <Dialog
        header="Hide Columns"
        visible={showColumns}
        onHide={() => setShowColumns(false)}
        style={{ width: "30rem" }}
      >
        <div className="card flex flex-column gap-3">
          <MultiSelect
            value={selectedHideFields}
            onChange={(e) => setSelectedHideFields(e.value)}
            options={fields}
            optionLabel="name"
            optionValue="value"
            filter
            placeholder="Select Columns to Hide"
            maxSelectedLabels={3}
            className="w-full"
          />
          <Button
            label="Save"
            onClick={() => {
              onClickSaveHiddenfields(selectedHideFields);
            }}
            className="w-full"
          />
        </div>
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
    </>
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

export default connect(mapState, mapDispatch)(AccidentCasesDataTable);
