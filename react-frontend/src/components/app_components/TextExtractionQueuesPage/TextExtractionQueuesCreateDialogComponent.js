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

const TextExtractionQueuesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [caseDocumentId, setCaseDocumentId] = useState([]);
  const [documentStorageId, setDocumentStorageId] = useState([]);
  const [caseNo, setCaseNo] = useState([]);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [caseDocumentId, documentStorageId, caseNo],
        setError,
      );
    }
    set_entity({ ...init });
    setError({});
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.documentType)) {
      error["documentType"] = `Document Type field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      caseDocumentId: _entity?.caseDocumentId?._id,
      documentStorageId: _entity?.documentStorageId?._id,
      documentType: _entity?.documentType,
      caseNo: _entity?.caseNo?._id,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("textExtractionQueues").create(_data);
      const eagerResult = await client.service("textExtractionQueues").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
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
        title: "Create info",
        message: "Info Text Extraction Queues updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Text Extraction Queues",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount caseDocuments
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
  const documentStorageIdOptions = documentStorageId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const caseNoOptions = caseNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create Text Extraction Queues"
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
        role="textExtractionQueues-create-dialog-component"
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
            {!_.isEmpty(error["caseDocumentId"]) ? (
              <p className="m-0" key="error-caseDocumentId">
                {error["caseDocumentId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="documentStorageId">Document Storage Id:</label>
            <Dropdown
              id="documentStorageId"
              value={_entity?.documentStorageId?._id}
              optionLabel="name"
              optionValue="value"
              options={documentStorageIdOptions}
              onChange={(e) =>
                setValByKey("documentStorageId", { _id: e.value })
              }
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["documentStorageId"]) ? (
              <p className="m-0" key="error-documentStorageId">
                {error["documentStorageId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="documentType">Document Type:</label>
            <InputText
              id="documentType"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.documentType}
              onChange={(e) => setValByKey("documentType", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["documentType"]) ? (
              <p className="m-0" key="error-documentType">
                {error["documentType"]}
              </p>
            ) : null}
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
            {!_.isEmpty(error["caseNo"]) ? (
              <p className="m-0" key="error-caseNo">
                {error["caseNo"]}
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
)(TextExtractionQueuesCreateDialogComponent);
