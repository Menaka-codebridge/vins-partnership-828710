import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import moment from "moment";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { getSchemaValidationErrorsStrings } from "../../../utils";

const UserChangePasswordCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();

  useEffect(() => {
    set_entity(props.entity);
  }, [props.entity, props.show]);

  const onSave = async () => {
    let _data = {
      userEmail: _entity?.userEmail,
      server: _entity?.server,
      environment: _entity?.environment,
      code: _entity?.code,
      status: _entity?.status,
      sendEmailCounter: _entity?.sendEmailCounter,
    };

    setLoading(true);
    try {
      const result = await client
        .service("userChangePassword")
        .patch(_entity._id, _data);
      props.onHide();
      props.alert({
        type: "success",
        title: "Edit info",
        message: "Info userChangePassword updated successfully",
      });
      props.onEditResult(result);
    } catch (error) {
      console.debug("error", error);
      setError(
        getSchemaValidationErrorsStrings(error) || "Failed to update info",
      );
      props.alert({
        type: "error",
        title: "Edit info",
        message: "Failed to update info",
      });
    }
    setLoading(false);
  };

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

  return (
    <Dialog
      header="Edit UserChangePassword"
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
        role="userChangePassword-edit-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="userEmail">User Email:</label>
            <InputText
              id="userEmail"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.userEmail}
              onChange={(e) => setValByKey("userEmail", e.target.value)}
              required
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="server">Server:</label>
            <InputText
              id="server"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.server}
              onChange={(e) => setValByKey("server", e.target.value)}
              required
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="environment">Environment:</label>
            <InputText
              id="environment"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.environment}
              onChange={(e) => setValByKey("environment", e.target.value)}
              required
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="code">Code:</label>
            <InputText
              id="code"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.code}
              onChange={(e) => setValByKey("code", e.target.value)}
              required
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="status">Status:</label>
            <Checkbox
              id="status"
              className="ml-3"
              checked={_entity?.status}
              onChange={(e) => setValByKey("status", e.checked)}
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="sendEmailCounter">SendEmailCounter:</label>
            <InputNumber
              id="sendEmailCounter"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.sendEmailCounter}
              useGrouping={false}
              onChange={(e) => setValByKey("sendEmailCounter", e.target.value)}
            />
          </span>
        </div>
        <div className="col-12">&nbsp;</div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="created At:"></Tag>
            {" " + moment(_entity?.createdAt).fromNow()}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="created By:"></Tag>
            {" " + _entity?.createdBy?.name}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="last Updated At:"></Tag>
            {" " + moment(_entity?.updatedAt).fromNow()}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="last Updated By:"></Tag>
            {" " + _entity?.updatedBy?.name}
          </p>
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
)(UserChangePasswordCreateDialogComponent);
