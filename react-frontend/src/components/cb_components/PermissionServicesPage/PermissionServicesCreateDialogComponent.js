import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { getSchemaValidationErrorsStrings } from "../../../utils";

const PermissionServicesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [profile, setProfile] = useState([]);
  const [roleId, setRoleId] = useState([]);
  const [positionId, setPositionId] = useState([]);
  const [employeeId, setEmployeeId] = useState([]); // This seems unused
  const [userId, setUserId] = useState([]); // This seems unused
  const [selectedOption, setSelectedOption] = useState("roleId");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [crudAll, setCRUDAll] = useState(false);
  const [adminAll, setAdminAll] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = process.env.REACT_APP_SERVER_URL + "/listServices";
        const response = await axios.get(apiUrl);
        if (response.data?.status && response.data?.data) {
          setServiceOptions(response.data.data);
        } else {
          console.error("Failed to fetch service options:", response.data);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);

  const validate = () => {
    let ret = true;
    const error = {};

    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      service: _entity?.service,
      create: _entity?.create || false,
      read: _entity?.read || false, // Ensure default value for all checkboxes
      update: _entity?.update || false,
      delete: _entity?.delete || false,
      import: _entity?.import || false,
      export: _entity?.export || false,
      seeder: _entity?.seeder || false,
      profile: _entity?.profile?._id,
      roleId: _entity?.roleId?._id,
      positionId: _entity?.positionId?._id,
      employeeId: _entity?.employeeId?._id,
      userId: _entity?.userId?._id,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);
    let errorMessage = "";
    try {
      const result = await client.service("permissionServices").create(_data);

      const eagerResult = await client.service("permissionServices").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "profile",
              service: "profiles",
              select: ["name"],
            },
          ],
        },
      });
      set_entity({});
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info Service Permissions updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.error("Error creating permission service:", error);
      errorMessage = "Failed to create in Service Permissions";
      if (error.type === "FeathersError" && error.errors) {
        if (error.message && error.message.includes("value already exists")) {
          if (error.message.includes("roleId")) {
            errorMessage = `Selected role with the service '${_data.service}' already exists.`;
          } else if (error.message.includes("positionId")) {
            errorMessage = `Selected position with the service '${_data.service}' already exists.`;
          } else if (error.message.includes("profile")) {
            errorMessage = `Selected profile with the service '${_data.service}' already exists.`;
          } else {
            errorMessage = `A record with the service '${_data.service}' already exists.`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setError({ error: errorMessage });
    } finally {
      setLoading(false);
    }

    if (errorMessage) {
      props.alert({
        type: "error",
        title: "Create",
        message: errorMessage,
      });
    }
  };

  useEffect(() => {
    // on mount profiles
    client
      .service("profiles")
      .find({
        query: {
          $limit: 10000,
          $sort: { name: 1 },
          _id: urlParams.singleProfilesId,
        },
      })
      .then((res) => {
        setProfile(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Profiles",
          type: "error",
          message: error.message || "Failed get profiles",
        });
      });

    // on mount roles
    client
      .service("roles")
      .find({
        query: {
          $limit: 10000,
          $sort: { name: 1 },
          _id: urlParams.singleRolesId,
        },
      })
      .then((res) => {
        setRoleId(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Roles",
          type: "error",
          message: error.message || "Failed get roles",
        });
      });

    // on mount positions
    client
      .service("positions")
      .find({
        query: {
          $limit: 10000,
          $sort: { name: 1 },
          _id: urlParams.singlePositionsId,
        },
      })
      .then((res) => {
        setPositionId(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Positions",
          type: "error",
          message: error.message || "Failed get positions",
        });
      });

    // on mount users
    client
      .service("users")
      .find({
        query: {
          $limit: 10000,
          $sort: { name: 1 },
          _id: urlParams.singleUsersId,
        },
      })
      .then((res) => {
        setUserId(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Users",
          type: "error",
          message: error.message || "Failed get users",
        });
      });
  }, []);

  const renderFooter = () => (
    <div className="flex justify-content-end">
      <Button
        label="save"
        className="p-button-text no-focus-effect"
        onClick={onSave}
        loading={loading}
      />
      <Button
        label="close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError({});
  };

  // Define the options outside of the main render function. It is more readable.
  const profileOptions = profile.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const roleIdOptions = roleId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const positionIdOptions = positionId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  const userIdOptions = userId.map((elem) => ({
    // this is declared but seemingly not used
    name: elem.name,
    value: elem.value,
  }));

  // Function to handle "Select All", "Admin", and "CRUD Only" checkboxes.
  const handleGroupCheckboxChange = (group, value) => {
    let updatedEntity = { ..._entity };

    switch (group) {
      case "all":
        setSelectAll(value); // Keep track of "Select All" state separately.
        setAdminAll(value);
        setCRUDAll(value);
        updatedEntity = {
          ...updatedEntity,
          create: value,
          read: value,
          update: value,
          delete: value,
          import: value,
          export: value,
          seeder: value,
        };
        break;
      case "admin":
        setAdminAll(value);
        updatedEntity = {
          ...updatedEntity,
          import: value,
          export: value,
          seeder: value,
        };
        break;
      case "crud":
        setCRUDAll(value);
        updatedEntity = {
          ...updatedEntity,
          create: value,
          read: value,
          update: value,
          delete: value,
        };
        break;
      default:
        break;
    }
    set_entity(updatedEntity);
  };

  // useEffect to deselect the other checkboxes when "Select All", "Admin", or "CRUD Only" is unchecked.
  useEffect(() => {
    if (!selectAll) {
      set_entity((prevEntity) => ({
        ...prevEntity,
        create: false,
        read: false,
        update: false,
        delete: false,
        import: false,
        export: false,
        seeder: false,
      }));
    }
  }, [selectAll]);

  useEffect(() => {
    if (!adminAll) {
      set_entity((prevEntity) => ({
        ...prevEntity,
        import: false,
        export: false,
        seeder: false,
      }));
    }
  }, [adminAll]);

  useEffect(() => {
    if (!crudAll) {
      set_entity((prevEntity) => ({
        ...prevEntity,
        create: false,
        read: false,
        update: false,
        delete: false,
      }));
    }
  }, [crudAll]);

  return (
    <Dialog
      header="Create Service Permissions"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="permissionServices-create-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="service">Service:</label>
            <Dropdown
              id="service"
              className="w-full mb-3 mt-2"
              value={_entity?.service}
              options={serviceOptions}
              onChange={(e) => setValByKey("service", e.value)}
              filter // Enables the search functionality
              filterBy="service" // Field to search by in the dropdown options
              placeholder="Select a Service"
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["service"]) ? (
              <p className="m-0" key="error-service">
                {error["service"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-6 field mt-5">
          <div className="p-field-checkbox mb-2">
            <input
              type="radio"
              id="roleId"
              name="selectionOption"
              onChange={() => setSelectedOption("roleId")}
              checked={selectedOption === "roleId"}
            />
            <label htmlFor="roleId">Role</label>
            <input
              type="radio"
              id="positionId"
              name="selectionOption"
              onChange={() => setSelectedOption("positionId")}
              checked={selectedOption === "positionId"}
            />
            <label htmlFor="positionId">Position</label>
            <input
              type="radio"
              id="profile"
              name="selectionOption"
              onChange={() => setSelectedOption("profile")}
              checked={selectedOption === "profile"}
            />
            <label htmlFor="profile">Profile</label>
          </div>

          {selectedOption === "profile" && (
            <div>
              <Dropdown
                id="profile"
                value={_entity?.profile?._id}
                optionLabel="name"
                optionValue="value"
                options={profileOptions}
                onChange={(e) => setValByKey("profile", { _id: e.value })}
              />
            </div>
          )}

          {selectedOption === "roleId" && (
            <div>
              <Dropdown
                id="roleId"
                value={_entity?.roleId?._id}
                optionLabel="name"
                optionValue="value"
                options={roleIdOptions}
                onChange={(e) => setValByKey("roleId", { _id: e.value })}
              />
            </div>
          )}

          {selectedOption === "positionId" && (
            <div>
              <Dropdown
                id="positionId"
                value={_entity?.positionId?._id}
                optionLabel="name"
                optionValue="value"
                options={positionIdOptions}
                onChange={(e) => setValByKey("positionId", { _id: e.value })}
              />
            </div>
          )}
        </div>

        {/* Grouped Checkboxes */}
        <div className="col-12 flex justify-content-center">
          <div className="md:col-4 field flex mt-3">
            <label htmlFor="create">Select All:</label>
            <Checkbox
              id="selectAll"
              className="ml-3"
              checked={selectAll}
              onChange={(e) => handleGroupCheckboxChange("all", e.checked)}
            />
          </div>
          <div className="col-12 md:col-4 field">
            <label htmlFor="admin">Admin:</label>
            <Checkbox
              id="admin"
              className="ml-3"
              checked={adminAll}
              onChange={(e) => handleGroupCheckboxChange("admin", e.checked)}
            />
          </div>
          <div className="col-12 md:col-4 field">
            <label htmlFor="crud">Crud Only:</label>
            <Checkbox
              id="crud"
              className="ml-3"
              checked={crudAll}
              onChange={(e) => handleGroupCheckboxChange("crud", e.checked)}
            />
          </div>
        </div>

        {/* Individual Checkboxes */}
        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="create">Create:</label>
            <Checkbox
              id="create"
              className="ml-3"
              checked={_entity?.create}
              onChange={(e) => setValByKey("create", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["create"]) ? (
              <p className="m-0" key="error-create">
                {error["create"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="read">Read:</label>
            <Checkbox
              id="read"
              className="ml-3"
              checked={_entity?.read}
              onChange={(e) => setValByKey("read", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["read"]) ? (
              <p className="m-0" key="error-read">
                {error["read"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="update">Update:</label>
            <Checkbox
              id="update"
              className="ml-3"
              checked={_entity?.update}
              onChange={(e) => setValByKey("update", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["update"]) ? (
              <p className="m-0" key="error-update">
                {error["update"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="delete">Delete:</label>
            <Checkbox
              id="delete"
              className="ml-3"
              checked={_entity?.delete}
              onChange={(e) => setValByKey("delete", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["delete"]) ? (
              <p className="m-0" key="error-delete">
                {error["delete"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="import">Import:</label>
            <Checkbox
              id="import"
              className="ml-3"
              checked={_entity?.import}
              onChange={(e) => setValByKey("import", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["import"]) ? (
              <p className="m-0" key="error-import">
                {error["import"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="export">Export:</label>
            <Checkbox
              id="export"
              className="ml-3"
              checked={_entity?.export}
              onChange={(e) => setValByKey("export", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["export"]) ? (
              <p className="m-0" key="error-export">
                {error["export"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-3 field mt-5">
          <span className="align-items-center">
            <label htmlFor="seeder">Seeder:</label>
            <Checkbox
              id="seeder"
              className="ml-3"
              checked={_entity?.seeder}
              onChange={(e) => setValByKey("seeder", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["seeder"]) ? (
              <p className="m-0" key="error-seeder">
                {error["seeder"]}
              </p>
            ) : null}
          </small>
        </div>

        <small className="p-error">
          {error.error ? (
            <p className="m-0">{error.error}</p>
          ) : Array.isArray(Object.keys(error)) ? (
            Object.keys(error).map((e, i) => (
              <p className="m-0" key={i}>
                {e}: {error[e]}
              </p>
            ))
          ) : (
            error
          )}
        </small>
      </div>
    </Dialog>
  );
};

const mapState = (state) => {
  const { user } = state.auth;
  return { user };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(
  mapState,
  mapDispatch,
)(PermissionServicesCreateDialogComponent);
