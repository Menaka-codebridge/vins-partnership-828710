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
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

const getSchemaValidationErrorsStrings = (errorObj) => {
  let errMsg = {};
  for (const key in errorObj.errors) {
    if (Object.hasOwnProperty.call(errorObj.errors, key)) {
      const element = errorObj.errors[key];
      if (element?.message) {
        errMsg.push(element.message);
      }
    }
  }
  return errMsg.length ? errMsg : errorObj.message ? errorObj.message : null;
};

const AccidentCasesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [user, setUser] = useState([]);

  useEffect(() => {
    set_entity(props.entity);
  }, [props.entity, props.show]);

  useEffect(() => {
    //on mount users
    client
      .service("users")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleUsersId,
        },
      })
      .then((res) => {
        setUser(
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

  const onSave = async () => {
    let _data = {
      insuranceRef: _entity?.insuranceRef,
      summonsNo: _entity?.summonsNo,
      court: _entity?.court,
      plaintiffSolicitors: _entity?.plaintiffSolicitors,
      plaintiff: _entity?.plaintiff,
      insuredDriver: _entity?.insuredDriver,
      insured: _entity?.insured,
      insuredVehicle: _entity?.insuredVehicle,
      collisionDateTime: _entity?.collisionDateTime,
      claimStatus: _entity?.claimStatus,
      user: _entity?.user?._id,
      synonyms: _entity?.synonyms,
      parameters: _entity?.parameters,
    };

    setLoading(true);
    try {
      await client.service("accidentCases").patch(_entity._id, _data);
      const eagerResult = await client.service("accidentCases").find({
        query: {
          $limit: 10000,
          _id: { $in: [_entity._id] },
          $populate: [
            {
              path: "user",
              service: "users",
              select: ["name"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Edit info",
        message: "Info accidentCases updated successfully",
      });
      props.onEditResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
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

  const userOptions = user.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Edit Accident Cases"
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
        role="accidentCases-edit-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="insuranceRef">Insurance Ref:</label>
            <InputText
              id="insuranceRef"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.insuranceRef}
              onChange={(e) => setValByKey("insuranceRef", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["insuranceRef"]) && (
              <p className="m-0" key="error-insuranceRef">
                {error["insuranceRef"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="summonsNo">summons No:</label>
            <InputText
              id="summonsNo"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.summonsNo}
              onChange={(e) => setValByKey("summonsNo", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["summonsNo"]) && (
              <p className="m-0" key="error-summonsNo">
                {error["summonsNo"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="court">Court:</label>
            <InputText
              id="court"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.court}
              onChange={(e) => setValByKey("court", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["court"]) && (
              <p className="m-0" key="error-court">
                {error["court"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="plaintiffSolicitors">Plaintiff Solicitors:</label>
            <InputText
              id="plaintiffSolicitors"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.plaintiffSolicitors}
              onChange={(e) =>
                setValByKey("plaintiffSolicitors", e.target.value)
              }
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["plaintiffSolicitors"]) && (
              <p className="m-0" key="error-plaintiffSolicitors">
                {error["plaintiffSolicitors"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="plaintiff">Plaintiff:</label>
            <InputText
              id="plaintiff"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.plaintiff}
              onChange={(e) => setValByKey("plaintiff", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["plaintiff"]) && (
              <p className="m-0" key="error-plaintiff">
                {error["plaintiff"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="insuredDriver">Insured Driver:</label>
            <InputText
              id="insuredDriver"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.insuredDriver}
              onChange={(e) => setValByKey("insuredDriver", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["insuredDriver"]) && (
              <p className="m-0" key="error-insuredDriver">
                {error["insuredDriver"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="insured">Insured:</label>
            <InputText
              id="insured"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.insured}
              onChange={(e) => setValByKey("insured", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["insured"]) && (
              <p className="m-0" key="error-insured">
                {error["insured"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="insuredVehicle">Insured Vehicle:</label>
            <InputText
              id="insuredVehicle"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.insuredVehicle}
              onChange={(e) => setValByKey("insuredVehicle", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["insuredVehicle"]) && (
              <p className="m-0" key="error-insuredVehicle">
                {error["insuredVehicle"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="collisionDateTime">Collision Date Time:</label>
            <Calendar
              id="collisionDateTime"
              value={
                _entity?.collisionDateTime
                  ? new Date(_entity?.collisionDateTime)
                  : null
              }
              onChange={(e) =>
                setValByKey("collisionDateTime", new Date(e.target.value))
              }
              showIcon
              showButtonBar
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["collisionDateTime"]) && (
              <p className="m-0" key="error-collisionDateTime">
                {error["collisionDateTime"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="claimStatus">ClaimStatus:</label>
            <InputText
              id="claimStatus"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.claimStatus}
              onChange={(e) => setValByKey("claimStatus", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["claimStatus"]) && (
              <p className="m-0" key="error-claimStatus">
                {error["claimStatus"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="user">User:</label>
            <Dropdown
              id="user"
              value={_entity?.user?._id}
              optionLabel="name"
              optionValue="value"
              options={userOptions}
              onChange={(e) => setValByKey("user", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["user"]) && (
              <p className="m-0" key="error-user">
                {error["user"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="synonyms">Synonyms:</label>
            <InputText
              id="synonyms"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.synonyms}
              onChange={(e) => setValByKey("synonyms", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["synonyms"]) && (
              <p className="m-0" key="error-synonyms">
                {error["synonyms"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="parameters">Parameters:</label>
            <InputText
              id="parameters"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.parameters}
              onChange={(e) => setValByKey("parameters", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["parameters"]) && (
              <p className="m-0" key="error-parameters">
                {error["parameters"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12">&nbsp;</div>
        <small className="p-error">
          {Array.isArray(Object.keys(error))
            ? Object.keys(error).map((e, i) => (
                <p className="m-0" key={i}>
                  {e}: {error[e]}
                </p>
              ))
            : error}
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
)(AccidentCasesCreateDialogComponent);
