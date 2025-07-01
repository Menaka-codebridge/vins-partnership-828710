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

const PromptQueuesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [sectionContentId, setSectionContentId] = useState([]);
  const [summonsNo, setSummonsNo] = useState([]);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [sectionContentId, summonsNo],
        setError,
      );
    }
    set_entity({ ...init });
    setError({});
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.promptUsed)) {
      error["promptUsed"] = `Prompt Used field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.status)) {
      error["status"] = `Status field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.errorMessage)) {
      error["errorMessage"] = `Error Message field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      sectionContentId: _entity?.sectionContentId?._id,
      summonsNo: _entity?.summonsNo?._id,
      promptUsed: _entity?.promptUsed,
      status: _entity?.status,
      errorMessage: _entity?.errorMessage,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("promptQueues").create(_data);
      const eagerResult = await client.service("promptQueues").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "sectionContentId",
              service: "sectionContents",
              select: ["subsection"],
            },
            {
              path: "summonsNo",
              service: "accidentCases",
              select: ["insuranceRef"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info PromptQueues updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in PromptQueues",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount sectionContents
    client
      .service("sectionContents")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleSectionContentsId,
        },
      })
      .then((res) => {
        setSectionContentId(
          res.data.map((e) => {
            return { name: e["subsection"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "SectionContents",
          type: "error",
          message: error.message || "Failed get sectionContents",
        });
      });
  }, []);

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
            return { name: e["insuranceRef"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "AccidentCases",
          type: "error",
          message: error.message || "Failed get accidentCases",
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
  const summonsNoOptions = summonsNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create PromptQueues"
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
        role="promptQueues-create-dialog-component"
      >
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
            <label htmlFor="promptUsed">Prompt Used:</label>
            <InputText
              id="promptUsed"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.promptUsed}
              onChange={(e) => setValByKey("promptUsed", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["promptUsed"]) ? (
              <p className="m-0" key="error-promptUsed">
                {error["promptUsed"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="status">Status:</label>
            <InputText
              id="status"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.status}
              onChange={(e) => setValByKey("status", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["status"]) ? (
              <p className="m-0" key="error-status">
                {error["status"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="errorMessage">Error Message:</label>
            <InputText
              id="errorMessage"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.errorMessage}
              onChange={(e) => setValByKey("errorMessage", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["errorMessage"]) ? (
              <p className="m-0" key="error-errorMessage">
                {error["errorMessage"]}
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

export default connect(
  mapState,
  mapDispatch,
)(PromptQueuesCreateDialogComponent);
