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
import UploadFilesToS3 from "../../../services/UploadFilesToS3";


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
    return errMsg.length ? errMsg : errorObj.message ? { error : errorObj.message} : {};
};

const CaseDocumentsCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [caseNo, setCaseNo] = useState([])

    useEffect(() => {
        let init  = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [caseNo], setError);
        }
        set_entity({...init});
        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
          
            if (_.isEmpty(_entity?.extractedContent)) {
                error["extractedContent"] = `Extracted Content field is required`;
                ret = false;
            }
  
            if (_.isEmpty(_entity?.uploadedDocument)) {
                error["uploadedDocument"] = `Uploaded Document field is required`;
                ret = false;
            }
        if (!ret) setError(error);
        return ret;
    }

    const onSave = async () => {
        if(!validate()) return;
        let _data = {
            caseNo: _entity?.caseNo?._id,extractedContent: _entity?.extractedContent,uploadTimestamp: _entity?.uploadTimestamp,uploadedDocument: _entity?.uploadedDocument,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            
        const result = await client.service("caseDocuments").create(_data);
        const eagerResult = await client
            .service("caseDocuments")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[result._id]}, $populate : [
                {
                    path : "caseNo",
                    service : "accidentCases",
                    select:["caseNo"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Create info", message: "Info Case Documents updated successfully" });
        props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.debug("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
            props.alert({ type: "error", title: "Create", message: "Failed to create in Case Documents" });
        }
        setLoading(false);
    };

    const onFileuploadedDocumentLoaded = (file, status) => {
    if (status)
      props.alert({
        title: "file uploader",
        type: "success",
        message: "file uploaded" + file.name
      });
    else
      props.alert({
        title: "file uploader",
        type: "error",
        message: "file uploader failed" + file.name
      });
  };

    const setuploadedDocumentId = (id) => { setValByKey("uploadedDocument", id);  };

    useEffect(() => {
                    // on mount accidentCases
                    client
                        .service("accidentCases")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleAccidentCasesId } })
                        .then((res) => {
                            setCaseNo(res.data.map((e) => { return { name: e['caseNo'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.debug({ error });
                            props.alert({ title: "AccidentCases", type: "error", message: error.message || "Failed get accidentCases" });
                        });
                }, []);

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const caseNoOptions = caseNo.map((elem) => ({ name: elem.name, value: elem.value }));

    return (
        <Dialog header="Create Case Documents" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="caseDocuments-create-dialog-component">
            <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="caseNo">Case No:</label>
                <Dropdown id="caseNo" value={_entity?.caseNo?._id} optionLabel="name" optionValue="value" options={caseNoOptions} onChange={(e) => setValByKey("caseNo", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["caseNo"]) ? (
              <p className="m-0" key="error-caseNo">
                {error["caseNo"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="extractedContent">Extracted Content:</label>
                <InputText id="extractedContent" className="w-full mb-3 p-inputtext-sm" value={_entity?.extractedContent} onChange={(e) => setValByKey("extractedContent", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["extractedContent"]) ? (
              <p className="m-0" key="error-extractedContent">
                {error["extractedContent"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="uploadTimestamp">UploadTimestamp:</label>
                <Calendar id="uploadTimestamp"  value={_entity?.uploadTimestamp ? new Date(_entity?.uploadTimestamp) : null} dateFormat="dd/mm/yy" onChange={ (e) => setValByKey("uploadTimestamp", new Date(e.value))} showIcon showButtonBar  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["uploadTimestamp"]) ? (
              <p className="m-0" key="error-uploadTimestamp">
                {error["uploadTimestamp"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="uploadedDocument">Uploaded Document:</label>
                        <UploadFilesToS3 type={'create'} user={props.user} id={urlParams.id} serviceName="caseDocuments" onUploadComplete={setuploadedDocumentId} onFileLoaded={onFileuploadedDocumentLoaded}/>
                    </span>
                    <small className="p-error">
                    {!_.isEmpty(error["uploadedDocument"]) ? (
                      <p className="m-0" key="error-uploadedDocument">
                        {error["uploadedDocument"]}
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

export default connect(mapState, mapDispatch)(CaseDocumentsCreateDialogComponent);
