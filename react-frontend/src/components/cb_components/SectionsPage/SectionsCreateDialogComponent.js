import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { getSchemaValidationErrorsStrings } from "../../../utils";
const SectionsCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [departmentId, setDepartmentId] = useState([]);

  useEffect(() => {
    let init = { isDefault: false };
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [departmentId],
        setError,
      );
    }
    set_entity({ ...init });
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      departmentId: _entity?.departmentId?._id,
      name: _entity?.name,
      code: _entity?.code,
      isDefault: _entity?.isDefault || false,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("sections").create(_data);
      const eagerResult = await client.service("sections").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "departmentId",
              service: "departments",
              select: ["name"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info Sections updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Sections",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount departments
    client
      .service("departments")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleDepartmentsId,
        },
      })
      .then((res) => {
        setDepartmentId(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Departments",
          type: "error",
          message: error.message || "Failed get departments",
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

  const departmentIdOptions = departmentId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create Sections"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max zoomin animation-duration-700"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="sections-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="departmentId">Department:</label>
            <Dropdown
              id="departmentId"
              value={_entity?.departmentId?._id}
              optionLabel="name"
              optionValue="value"
              options={departmentIdOptions}
              onChange={(e) => setValByKey("departmentId", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["departmentId"]) ? (
              <p className="m-0" key="error-departmentId">
                {error["departmentId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="name">Name:</label>
            <InputText
              id="name"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.name}
              onChange={(e) => setValByKey("name", e.target.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["name"]) ? (
              <p className="m-0" key="error-name">
                {error["name"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="code">Code:</label>
            <InputText
              id="code"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.code}
              onChange={(e) => setValByKey("code", e.target.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["code"]) ? (
              <p className="m-0" key="error-code">
                {error["code"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field flex">
          <span className="align-items-center">
            <label htmlFor="isDefault">Is default:</label>
            <Checkbox
              id="isDefault"
              className="ml-3"
              checked={_entity?.isDefault}
              onChange={(e) => setValByKey("isDefault", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["isDefault"]) ? (
              <p className="m-0" key="error-isDefault">
                {error["isDefault"]}
              </p>
            ) : null}
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

export default connect(mapState, mapDispatch)(SectionsCreateDialogComponent);
