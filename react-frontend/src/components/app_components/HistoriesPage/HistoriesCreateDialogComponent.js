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
import { Calendar } from "primereact/calendar";

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

const HistoriesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [summonsNo, setSummonsNo] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [summonsNo, users],
        setError,
      );
    }
    set_entity({ ...init });
    setError({});
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.userPrompt)) {
      error["userPrompt"] = `User Prompt field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.parametersUsed)) {
      error["parametersUsed"] = `Parameters Used field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.synonymsUsed)) {
      error["synonymsUsed"] = `Synonyms Used field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.responseReceived)) {
      error["responseReceived"] = `Response Received field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.section)) {
      error["section"] = `Section field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.subSection)) {
      error["subSection"] = `Sub Section field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      summonsNo: _entity?.summonsNo?._id,
      users: _entity?.users?._id,
      timestamp: _entity?.timestamp,
      userPrompt: _entity?.userPrompt,
      parametersUsed: _entity?.parametersUsed,
      synonymsUsed: _entity?.synonymsUsed,
      responseReceived: _entity?.responseReceived,
      section: _entity?.section,
      subSection: _entity?.subSection,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("histories").create(_data);
      const eagerResult = await client.service("histories").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "summonsNo",
              service: "accidentCases",
              select: ["summonsNo"],
            },
            {
              path: "users",
              service: "users",
              select: ["name"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info Histories updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Histories",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount accidentCases
    client
      .service("accidentCases")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleAccidentCasesId,
        },
      })
      .then((res) => {
        setSummonsNo(
          res.data.map((e) => {
            return { name: e["summonsNo"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "AccidentCases",
          type: "error",
          message: error.message || "Failed get accidentCases",
        });
      });
  }, []);

  useEffect(() => {
    // on mount users
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
        setUsers(
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

  const summonsNoOptions = summonsNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const usersOptions = users.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create Histories"
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
        role="histories-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="summonsNo">Case No:</label>
            <Dropdown
              id="summonsNo"
              value={_entity?.summonsNo?._id}
              optionLabel="name"
              optionValue="value"
              options={summonsNoOptions}
              onChange={(e) => setValByKey("summonsNo", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["summonsNo"]) ? (
              <p className="m-0" key="error-summonsNo">
                {error["summonsNo"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="users">Users:</label>
            <Dropdown
              id="users"
              value={_entity?.users?._id}
              optionLabel="name"
              optionValue="value"
              options={usersOptions}
              onChange={(e) => setValByKey("users", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["users"]) ? (
              <p className="m-0" key="error-users">
                {error["users"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="timestamp">Timestamp:</label>
            <Calendar
              id="timestamp"
              value={_entity?.timestamp ? new Date(_entity?.timestamp) : null}
              dateFormat="dd/mm/yy"
              onChange={(e) =>
                setValByKey("timestamp", new Date(e.target.value))
              }
              showIcon
              showButtonBar
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["timestamp"]) ? (
              <p className="m-0" key="error-timestamp">
                {error["timestamp"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="userPrompt">User Prompt:</label>
            <InputText
              id="userPrompt"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.userPrompt}
              onChange={(e) => setValByKey("userPrompt", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["userPrompt"]) ? (
              <p className="m-0" key="error-userPrompt">
                {error["userPrompt"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="parametersUsed">Parameters Used:</label>
            <InputText
              id="parametersUsed"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.parametersUsed}
              onChange={(e) => setValByKey("parametersUsed", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["parametersUsed"]) ? (
              <p className="m-0" key="error-parametersUsed">
                {error["parametersUsed"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="synonymsUsed">Synonyms Used:</label>
            <InputText
              id="synonymsUsed"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.synonymsUsed}
              onChange={(e) => setValByKey("synonymsUsed", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["synonymsUsed"]) ? (
              <p className="m-0" key="error-synonymsUsed">
                {error["synonymsUsed"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="responseReceived">Response Received:</label>
            <InputText
              id="responseReceived"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.responseReceived}
              onChange={(e) => setValByKey("responseReceived", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["responseReceived"]) ? (
              <p className="m-0" key="error-responseReceived">
                {error["responseReceived"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="section">Section:</label>
            <InputText
              id="section"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.section}
              onChange={(e) => setValByKey("section", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["section"]) ? (
              <p className="m-0" key="error-section">
                {error["section"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="subSection">Sub Section:</label>
            <InputText
              id="subSection"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.subSection}
              onChange={(e) => setValByKey("subSection", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["subSection"]) ? (
              <p className="m-0" key="error-subSection">
                {error["subSection"]}
              </p>
            ) : null}
          </small>
        </div>
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

export default connect(mapState, mapDispatch)(HistoriesCreateDialogComponent);
