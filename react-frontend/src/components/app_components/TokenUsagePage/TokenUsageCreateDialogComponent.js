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
import { InputNumber } from "primereact/inputnumber";

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

const TokenUsageCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [sectionContentId, setSectionContentId] = useState([]);
  const [promptQueueId, setPromptQueueId] = useState([]);
  const [summonsNo, setSummonsNo] = useState([]);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [sectionContentId, promptQueueId, summonsNo],
        setError,
      );
    }
    set_entity({ ...init });
    setError({});
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.jobId)) {
      error["jobId"] = `Job Id field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.section)) {
      error["section"] = `Section field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.subsection)) {
      error["subsection"] = `Subsection field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.modelId)) {
      error["modelId"] = `Model Id field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      jobId: _entity?.jobId,
      sectionContentId: _entity?.sectionContentId?._id,
      promptQueueId: _entity?.promptQueueId?._id,
      summonsNo: _entity?.summonsNo?._id,
      section: _entity?.section,
      subsection: _entity?.subsection,
      inputTokens: _entity?.inputTokens,
      outputTokens: _entity?.outputTokens,
      totalTokens: _entity?.totalTokens,
      modelId: _entity?.modelId,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("tokenUsage").create(_data);
      const eagerResult = await client.service("tokenUsage").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "sectionContentId",
              service: "companies",
              select: ["name"],
            },
            {
              path: "summonsNo",
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
        message: "Info TokenUsage updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in TokenUsage",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount companies
    client
      .service("companies")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleCompaniesId,
        },
      })
      .then((res) => {
        setSectionContentId(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed get companies",
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
        setSummonsNo(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
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

  const sectionContentIdOptions = sectionContentId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const promptQueueIdOptions = promptQueueId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const summonsNoOptions = summonsNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create TokenUsage"
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
        role="tokenUsage-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="jobId">Job Id:</label>
            <InputText
              id="jobId"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.jobId}
              onChange={(e) => setValByKey("jobId", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["jobId"]) ? (
              <p className="m-0" key="error-jobId">
                {error["jobId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="sectionContentId">Section Content Id:</label>
            <Dropdown
              id="sectionContentId"
              value={_entity?.sectionContentId?._id}
              optionLabel="name"
              optionValue="value"
              options={sectionContentIdOptions}
              onChange={(e) =>
                setValByKey("sectionContentId", { _id: e.value })
              }
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["sectionContentId"]) ? (
              <p className="m-0" key="error-sectionContentId">
                {error["sectionContentId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="promptQueueId">Prompt Queue Id:</label>
            <Dropdown
              id="promptQueueId"
              value={_entity?.promptQueueId?._id}
              optionLabel="name"
              optionValue="value"
              options={promptQueueIdOptions}
              onChange={(e) => setValByKey("promptQueueId", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["promptQueueId"]) ? (
              <p className="m-0" key="error-promptQueueId">
                {error["promptQueueId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="summonsNo">Summons No:</label>
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
            <label htmlFor="subsection">Subsection:</label>
            <InputText
              id="subsection"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.subsection}
              onChange={(e) => setValByKey("subsection", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["subsection"]) ? (
              <p className="m-0" key="error-subsection">
                {error["subsection"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="inputTokens">Input Tokens:</label>
            <InputNumber
              id="inputTokens"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.inputTokens}
              onChange={(e) => setValByKey("inputTokens", e.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["inputTokens"]) ? (
              <p className="m-0" key="error-inputTokens">
                {error["inputTokens"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="outputTokens">Output Tokens:</label>
            <InputNumber
              id="outputTokens"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.outputTokens}
              onChange={(e) => setValByKey("outputTokens", e.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["outputTokens"]) ? (
              <p className="m-0" key="error-outputTokens">
                {error["outputTokens"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="totalTokens">Total Tokens:</label>
            <InputNumber
              id="totalTokens"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.totalTokens}
              onChange={(e) => setValByKey("totalTokens", e.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["totalTokens"]) ? (
              <p className="m-0" key="error-totalTokens">
                {error["totalTokens"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="modelId">Model Id:</label>
            <InputText
              id="modelId"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.modelId}
              onChange={(e) => setValByKey("modelId", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["modelId"]) ? (
              <p className="m-0" key="error-modelId">
                {error["modelId"]}
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

export default connect(mapState, mapDispatch)(TokenUsageCreateDialogComponent);
