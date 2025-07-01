import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

const getSchemaValidationErrorsStrings = (errorObj) => {
  let errMsg = {};
  for (const key in errorObj.errors) {
    if (Object.hasOwnProperty.call(errorObj.errors, key)) {
      const element = errorObj.errors[key];
      if (element?.message) {
        errMsg[key] = element.message;
      }
    }
  }
  return errMsg.length
    ? errMsg
    : errorObj.message
      ? { error: errorObj.message }
      : {};
};

const CompanyPositionMappingsCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [company, setCompany] = useState([]);
  const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);
  const [mappingType, setMappingType] = useState("include");

  useEffect(() => {
    let init = { position: [] };
    if (!_.isEmpty(props?.entity)) {
      init = initilization({ ...props?.entity, ...init }, [company], setError);
    }
    set_entity({ ...init });
    setError({});
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.company)) {
      error["company"] = `Company field is required`;
      ret = false;
    }
    if (_.isEmpty(_entity?.position)) {
      error["position"] = `At least one position must be selected`;
      ret = false;
    }
    if (!mappingType) {
      error["mappingType"] = `Mapping Type field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Fetch all available positions
      const allPositions = await client.service("positions").find({
        query: { $limit: 10000, $sort: { createdAt: -1 } },
      });

      // Determine positions to save based on mappingType
      const allPositionIds = allPositions.data.map((pos) => pos._id);
      const selectedPositionIds = _entity.position;
      const positionsToSave =
        mappingType === "include"
          ? selectedPositionIds
          : allPositionIds.filter((id) => !selectedPositionIds.includes(id));

      // Create a single mapping object with the determined positions
      const mapping = {
        company: _entity?.company?._id,
        position: positionsToSave,
        createdBy: props.user._id,
        updatedBy: props.user._id,
      };

      // Create a single mapping record
      const result = await client
        .service("companyPositionMappings")
        .create(mapping);

      // Fetch the created mapping with populated data
      const eagerResult = await client.service("companyPositionMappings").find({
        query: {
          $limit: 1,
          _id: result._id,
          $populate: [
            {
              path: "company",
              service: "companies",
              select: ["name"],
            },
            {
              path: "position",
              service: "positions",
              select: ["name"],
            },
          ],
        },
      });

      props.onHide();
      props.alert({
        type: "success",
        title: "Create Company Position Mapping",
        message: "Company Position Mapping created successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create Company Position Mapping",
        message: "Failed to create Company Position Mapping",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch companies
    client
      .service("companies")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          ...(urlParams.singleCompaniesId && {
            _id: urlParams.singleCompaniesId,
          }),
        },
      })
      .then((res) => {
        setCompany(res.data.map((e) => ({ name: e.name, value: e._id })));
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed to fetch companies",
        });
      });
  }, []);

  useEffect(() => {
    // Fetch roles and positions
    client
      .service("roles")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
        },
      })
      .then((rolesRes) => {
        const formattedRoles = rolesRes.data.map((role) => ({
          label: role.name,
          code: role._id,
          items: [],
        }));

        client
          .service("positions")
          .find({
            query: {
              $limit: 10000,
              $sort: { createdAt: -1 },
            },
          })
          .then((positionsRes) => {
            positionsRes.data.forEach((position) => {
              const role = formattedRoles.find(
                (r) => r.code === position.roleId,
              );
              if (role) {
                role.items.push({
                  label: position.name,
                  value: position._id,
                });
              }
            });
            setPositionsRolesOptions(
              formattedRoles.filter((role) => role.items.length > 0),
            );
          })
          .catch((error) => {
            console.debug({ error });
            props.alert({
              title: "Positions",
              type: "error",
              message: error.message || "Failed to fetch positions",
            });
          });
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Roles",
          type: "error",
          message: error.message || "Failed to fetch roles",
        });
      });
  }, []);

  const renderFooter = () => (
    <div className="flex justify-content-end">
      <Button
        label="Save"
        className="p-button-text no-focus-effect"
        onClick={onSave}
        loading={loading}
      />
      <Button
        label="Close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError((prev) => ({ ...prev, [key]: null }));
  };

  const companyOptions = company.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  const groupTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <Dialog
      header="Create Company Position Mapping"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max scalein animation-ease-in-out animation-duration-1000"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="companyPositionMappings-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="company">Company:</label>
            <Dropdown
              id="company"
              value={_entity?.company?._id}
              optionLabel="name"
              optionValue="value"
              options={companyOptions}
              onChange={(e) => setValByKey("company", { _id: e.value })}
              placeholder="Select a company"
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["company"]) && (
              <p className="m-0" key="error-company">
                {error["company"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="positions">Positions:</label>
            <MultiSelect
              id="positions"
              value={_entity?.position}
              options={positionsRolesOptions}
              onChange={(e) => setValByKey("position", e.value)}
              optionLabel="label"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionGroupTemplate={groupTemplate}
              placeholder={
                positionsRolesOptions.length
                  ? "Select Positions"
                  : "No positions available"
              }
              display="chip"
              className="w-full"
              disabled={positionsRolesOptions.length === 0}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["position"]) && (
              <p className="m-0" key="error-position">
                {error["position"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label>Mapping Type:</label>
            <div className="flex flex-column gap-2 mt-2">
              <div className="flex align-items-center">
                <input
                  type="radio"
                  id="include"
                  name="mappingType"
                  value="include"
                  checked={mappingType === "include"}
                  onChange={(e) => setMappingType(e.target.value)}
                  style={{ marginRight: "8px" }}
                />
                <label htmlFor="include">Include Positions</label>
              </div>
              <div className="flex align-items-center">
                <input
                  type="radio"
                  id="exclude"
                  name="mappingType"
                  value="exclude"
                  checked={mappingType === "exclude"}
                  onChange={(e) => setMappingType(e.target.value)}
                  style={{ marginRight: "8px" }}
                />
                <label htmlFor="exclude">Exclude Positions</label>
              </div>
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["mappingType"]) && (
              <p className="m-0" key="error-mappingType">
                {error["mappingType"]}
              </p>
            )}
          </small>
        </div>
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
)(CompanyPositionMappingsCreateDialogComponent);
