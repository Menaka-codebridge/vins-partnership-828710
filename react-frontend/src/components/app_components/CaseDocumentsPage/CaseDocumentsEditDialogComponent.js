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
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";

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

const CaseDocumentsCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [summonsNo, setSummonsNo] = useState([]);

  useEffect(() => {
    set_entity(props.entity);
  }, [props.entity, props.show]);

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

  const onSave = async () => {
    let _data = {
      summonsNo: _entity?.summonsNo?._id,
      user: _entity?.user,
      fileName: _entity?.fileName,
      fileType: _entity?.fileType,
      storagePath: _entity?.storagePath,
      extractedContent: _entity?.extractedContent,
      uploadTimestamp: _entity?.uploadTimestamp,
    };

    setLoading(true);
    try {
      await client.service("caseDocuments").patch(_entity._id, _data);
      const eagerResult = await client.service("caseDocuments").find({
        query: {
          $limit: 10000,
          _id: { $in: [_entity._id] },
          $populate: [
            {
              path: "summonsNo",
              service: "accidentCases",
              select: ["summonsNo"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Edit info",
        message: "Info caseDocuments updated successfully",
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

  const summonsNoOptions = summonsNo.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Edit Case Documents"
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
        role="caseDocuments-edit-dialog-component"
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
            {!_.isEmpty(error["summonsNo"]) && (
              <p className="m-0" key="error-summonsNo">
                {error["summonsNo"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="user">User:</label>
            <InputText
              id="user"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.user}
              onChange={(e) => setValByKey("user", e.target.value)}
              required
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
            <label htmlFor="fileName">File Name:</label>
            <InputText
              id="fileName"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.fileName}
              onChange={(e) => setValByKey("fileName", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["fileName"]) && (
              <p className="m-0" key="error-fileName">
                {error["fileName"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="fileType">File Type:</label>
            <InputText
              id="fileType"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.fileType}
              onChange={(e) => setValByKey("fileType", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["fileType"]) && (
              <p className="m-0" key="error-fileType">
                {error["fileType"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="storagePath">Storage Path:</label>
            <InputText
              id="storagePath"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.storagePath}
              onChange={(e) => setValByKey("storagePath", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["storagePath"]) && (
              <p className="m-0" key="error-storagePath">
                {error["storagePath"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="extractedContent">Extracted Content:</label>
            <InputText
              id="extractedContent"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.extractedContent}
              onChange={(e) => setValByKey("extractedContent", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["extractedContent"]) && (
              <p className="m-0" key="error-extractedContent">
                {error["extractedContent"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="uploadTimestamp">UploadTimestamp:</label>
            <Calendar
              id="uploadTimestamp"
              value={
                _entity?.uploadTimestamp
                  ? new Date(_entity?.uploadTimestamp)
                  : null
              }
              onChange={(e) =>
                setValByKey("uploadTimestamp", new Date(e.target.value))
              }
              showIcon
              showButtonBar
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["uploadTimestamp"]) && (
              <p className="m-0" key="error-uploadTimestamp">
                {error["uploadTimestamp"]}
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
)(CaseDocumentsCreateDialogComponent);
