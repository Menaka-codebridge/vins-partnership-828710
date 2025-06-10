import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';


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

const SectionContentsEditDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [caseNo, setCaseNo] = useState([])

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

     useEffect(() => {
                    //on mount accidentCases
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

    const onSave = async () => {
        let _data = {
            caseNo: _entity?.caseNo?._id,
section: _entity?.section,
subsection: _entity?.subsection,
initialInference: _entity?.initialInference,
groundTruth: _entity?.groundTruth,
promptUsed: _entity?.promptUsed,
status: _entity?.status,
        };

        setLoading(true);
        try {
            
        await client.service("sectionContents").patch(_entity._id, _data);
        const eagerResult = await client
            .service("sectionContents")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[_entity._id]}, $populate : [
                {
                    path : "caseNo",
                    service : "accidentCases",
                    select:["caseNo"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Edit info", message: "Info sectionContents updated successfully" });
        props.onEditResult(eagerResult.data[0]);
        } catch (error) {
            console.debug("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to update info");
            props.alert({ type: "error", title: "Edit info", message: "Failed to update info" });
        }
        setLoading(false);
    };

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
        <Dialog header="Edit Section Contents" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="sectionContents-edit-dialog-component">
                <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="caseNo">Case No:</label>
                <Dropdown id="caseNo" value={_entity?.caseNo?._id} optionLabel="name" optionValue="value" options={caseNoOptions} onChange={(e) => setValByKey("caseNo", {_id : e.value})}  />
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
                <label htmlFor="section">Section:</label>
                <InputText id="section" className="w-full mb-3 p-inputtext-sm" value={_entity?.section} onChange={(e) => setValByKey("section", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["section"]) && (
              <p className="m-0" key="error-section">
                {error["section"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="subsection">Subsection:</label>
                <InputText id="subsection" className="w-full mb-3 p-inputtext-sm" value={_entity?.subsection} onChange={(e) => setValByKey("subsection", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["subsection"]) && (
              <p className="m-0" key="error-subsection">
                {error["subsection"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="initialInference">Initial Inference:</label>
                <InputText id="initialInference" className="w-full mb-3 p-inputtext-sm" value={_entity?.initialInference} onChange={(e) => setValByKey("initialInference", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["initialInference"]) && (
              <p className="m-0" key="error-initialInference">
                {error["initialInference"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="groundTruth">Ground Truth:</label>
                <InputText id="groundTruth" className="w-full mb-3 p-inputtext-sm" value={_entity?.groundTruth} onChange={(e) => setValByKey("groundTruth", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["groundTruth"]) && (
              <p className="m-0" key="error-groundTruth">
                {error["groundTruth"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="promptUsed">Promp Used:</label>
                <InputText id="promptUsed" className="w-full mb-3 p-inputtext-sm" value={_entity?.promptUsed} onChange={(e) => setValByKey("promptUsed", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["promptUsed"]) && (
              <p className="m-0" key="error-promptUsed">
                {error["promptUsed"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="status">Status:</label>
                <InputText id="status" className="w-full mb-3 p-inputtext-sm" value={_entity?.status} onChange={(e) => setValByKey("status", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["status"]) && (
              <p className="m-0" key="error-status">
                {error["status"]}
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

export default connect(mapState, mapDispatch)(SectionContentsCreateDialogComponent);
