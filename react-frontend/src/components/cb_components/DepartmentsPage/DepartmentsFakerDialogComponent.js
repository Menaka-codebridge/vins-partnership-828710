import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import client from "../../../services/restClient";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import departmentsFakerFactory from "./departmentsFakerFactory";

import { getSchemaValidationErrorsStrings } from "../../../utils";

const DepartmentsFakerDialogComponent = (props) => {
  const [fakerCount, setFakerCount] = useState(1);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyIdIds, setcompanyIdIds] = useState();

  useEffect(() => {
    setFakerCount(1);

    client
      .service("companies")
      .find({ query: { $select: ["_id", "name"] } })
      .then((data) => {
        setcompanyIdIds(data.data);
      });
  }, [props.show]);

  const onRun = async () => {
    let fakeData = departmentsFakerFactory(
      props.user,
      fakerCount,
      companyIdIds,
    );

    setLoading(true);
    const promises = fakeData.map((elem) =>
      client.service("departments").create(elem),
    );
    const results = await Promise.all(promises.map((p) => p.catch((e) => e)));
    const errors = results
      .filter((result) => result instanceof Error)
      .map(
        (err, index) =>
          `[${index}] ${getSchemaValidationErrorsStrings(err) || "Failed to create fake record"}`,
      );
    const validResults = results.filter((result) => !(result instanceof Error));
    props.alert({
      type: "success",
      title: "Faker",
      message: "Faker ran successfully",
    });
    props.onFakerCreateResults(validResults);
    setErrors(errors);
    setLoading(false);
    if (!(errors && errors.length)) props.onHide();
  };

  const renderFooter = () => (
    <div className="flex justify-content-end">
      <Button
        label="run"
        className="p-button-text no-focus-effect"
        onClick={onRun}
        loading={loading}
      />
      <Button
        label="close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const onChangeFakerCountHandler = (e) => {
    let val = e.target.value;
    val = Number(val);
    if (val < 1) val = 1;
    if (val > 100) val = 100;
    setFakerCount(val);
  };

  return (
    <Dialog
      header="Faker"
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
          <p className="m-0">Faker count:</p>
          <InputText
            className="w-full mb-3"
            type="number"
            value={fakerCount}
            onChange={onChangeFakerCountHandler}
          />
        </div>

        <small className="p-error">
          {Array.isArray(errors)
            ? errors.map((e, i) => (
                <p className="m-0" key={i}>
                  {e}
                </p>
              ))
            : errors}
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

export default connect(mapState, mapDispatch)(DepartmentsFakerDialogComponent);
