import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const AccountChangeString = (props) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [_entity, set_entity] = useState({});

  useEffect(() => {
    set_entity((prev) => (prev[props.field] = props.value));
  }, []);

  const onSave = async () => {
    setLoading(true);
    props.patchUser(props.user._id, _entity).then(
      (resp) => {
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        console.error(error.message);
      },
    );
  };

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError("");
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

  return (
    <Dialog
      header={props.header}
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max zoomin animation-duration-700"
      footer={renderFooter()}
      resizable={false}
    >
      <div>
        <div>
          <p className="m-0">{props.label}:</p>
          <InputText
            className="w-full mb-3"
            value={_entity?.name}
            onChange={(e) => setValByKey(props.fieldName, e.target.value)}
          />
        </div>

        <small className="p-error">
          {Array.isArray(error)
            ? error.map((e, i) => (
                <p className="m-0" key={i}>
                  {e}
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
  patchUser: (data) => dispatch.auth.patchUser(data),
});

export default connect(mapState, mapDispatch)(AccountChangeString);
