import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
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
        errMsg.push(element.message);
      }
    }
  }
  return errMsg.length ? errMsg : errorObj.message ? errorObj.message : null;
};

const GroundTruthQueuesEditDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [caseDocumentId, setCaseDocumentId] = useState([]);
  const [caseNo, setCaseNo] = useState([]);

  useEffect(() => {
    set_entity(props.entity);
  }, [props.entity, props.show]);

  useEffect(() => {
    //on mount caseDocuments
    client
      .service("caseDocuments")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleCaseDocumentsId,
        },
      })
      .then((res) => {
        setCaseDocumentId(
          res.data.map((e) => {
            return { name: e["caseNo"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "CaseDocuments",
          type: "error",
          message: error.message || "Failed get caseDocuments",
        });
      });
  }, []);
  useEffect(() => {
    //on mount accidentCases
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
        setCaseNo(
          res.data.map((e) => {
            return { name: e["caseNo"], value: e._id };
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

  const onSave = async () => {
    let _data = {
      caseDocumentId: _entity?.caseDocumentId?._id,
      caseNo: _entity?.caseNo?._id,
      status: _entity?.status,
      errorMessage: _entity?.errorMessage,
    };

    setLoading(true);
    try {
      await client.service("groundTruthQueues").patch(_entity._id, _data);
      const eagerResult = await client.service("groundTruthQueues").find({
        query: {
          $limit: 10000,
          _id: { $in: [_entity._id] },
          $populate: [
            {
              path: "caseDocumentId",
              service: "caseDocuments",
              select: ["caseNo"],
            },
            {
              path: "caseNo",
              service: "accidentCases",
              select: ["caseNo"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Edit info",
        message: "Info groundTruthQueues updated successfully",
      });
      props.onEditResult(eagerResult.data[0]);
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

  const caseDocumentIdOptions = caseDocumentId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const caseNoOptions = caseNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Edit GroundTruthQueues"
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
        role="groundTruthQueues-edit-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="caseDocumentId">Case Document Id:</label>
            <Dropdown
              id="caseDocumentId"
              value={_entity?.caseDocumentId?._id}
              optionLabel="name"
              optionValue="value"
              options={caseDocumentIdOptions}
              onChange={(e) => setValByKey("caseDocumentId", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["caseDocumentId"]) && (
              <p className="m-0" key="error-caseDocumentId">
                {error["caseDocumentId"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="caseNo">Case No:</label>
            <Dropdown
              id="caseNo"
              value={_entity?.caseNo?._id}
              optionLabel="name"
              optionValue="value"
              options={caseNoOptions}
              onChange={(e) => setValByKey("caseNo", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["caseNo"]) && (
              <p className="m-0" key="error-caseNo">
                {error["caseNo"]}
              </p>
            )}
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
            {!_.isEmpty(error["status"]) && (
              <p className="m-0" key="error-status">
                {error["status"]}
              </p>
            )}
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
            {!_.isEmpty(error["errorMessage"]) && (
              <p className="m-0" key="error-errorMessage">
                {error["errorMessage"]}
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
)(GroundTruthQueuesEditDialogComponent);
