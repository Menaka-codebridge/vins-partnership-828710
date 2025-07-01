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
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { getSchemaValidationErrorsStrings, updateMany } from "../../../utils";
import countryList from "country-list-js";

const UserAddressesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [userId, setUserId] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    // Initialize country options
    const countryNames = countryList.names();
    const countryArray = countryNames
      .map((name) => ({
        name,
        value: name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCountryOptions(countryArray);
  }, []);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization({ ...props?.entity, ...init }, [userId], setError);
    }
    set_entity({ ...init });
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (!_entity?.Country) {
      error["Country"] = "Country is required";
      ret = false;
    }

    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      userId: _entity?.userId?._id,
      Street1: _entity?.Street1,
      Street2: _entity?.Street2,
      Poscode: _entity?.Poscode,
      City: _entity?.City,
      State: _entity?.State,
      Province: _entity?.Province,
      Country: _entity?.Country,
      isDfault: _entity?.isDefault,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    if (_entity?.isDefault) {
      await updateMany({
        collection: "user_addresses",
        query: {
          userId: _entity?.userId?._id,
        },
        update: { isDefault: false },
        user: props.user,
      });
    } else {
      const validResult = await client.service("userAddresses").find({
        query: { userId: _entity?.userId?._id },
      });
      if (validResult.total <= 1) _data.isDfault = true;
    }

    try {
      const result = await client.service("userAddresses").create(_data);
      const eagerResult = await client.service("userAddresses").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "userId",
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
        message: "Info User Addresses updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in User Addresses",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch users for userId dropdown
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
        setUserId(
          res.data.map((e) => ({
            name: e["name"],
            value: e._id,
          })),
        );
      })
      .catch((error) => {
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
        label="Save"
        className="p-button-text no-focus-effect"
        onClick={onSave}
        loading={loading}
      />
      <Button
        label="Close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError((prev) => ({ ...prev, [key]: null }));
  };

  const userIdOptions = userId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create User Address"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max zoomin animation-duration-700"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="userAddresses-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="userId">User:</label>
            <Dropdown
              id="userId"
              value={_entity?.userId?._id}
              optionLabel="name"
              optionValue="value"
              options={userIdOptions}
              onChange={(e) => setValByKey("userId", { _id: e.value })}
              placeholder="Select a user"
              className="w-full"
            />
          </span>
          <small className="p-error">
            {error["userId"] && (
              <p className="m-0" key="error-userId">
                {error["userId"]}
              </p>
            )}
          </small>
        </div>

        <div className="col-12 md:col-6 field flex">
          <span className="align-items-center mt-5">
            <label htmlFor="isDefault">Is Default:</label>
            <Checkbox
              id="isDefault"
              className="ml-3"
              checked={_entity?.isDefault}
              onChange={(e) => setValByKey("isDefault", e.checked)}
            />
          </span>
        </div>

        <div className="col-12 field">
          <span className="align-items-center">
            <label htmlFor="Street1">Street 1:</label>
            <InputTextarea
              id="Street1"
              rows={3}
              cols={30}
              value={_entity?.Street1}
              onChange={(e) => setValByKey("Street1", e.target.value)}
              autoResize
              className="w-full"
            />
          </span>
          <small className="p-error">
            {error["Street1"] && (
              <p className="m-0" key="error-Street1">
                {error["Street1"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 field">
          <span className="align-items-center">
            <label htmlFor="Street2">Street 2:</label>
            <InputTextarea
              id="Street2"
              rows={3}
              cols={30}
              value={_entity?.Street2}
              onChange={(e) => setValByKey("Street2", e.target.value)}
              autoResize
              className="w-full"
            />
          </span>
          <small className="p-error">
            {error["Street2"] && (
              <p className="m-0" key="error-Street2">
                {error["Street2"]}
              </p>
            )}
          </small>
        </div>

        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="Poscode">Postcode:</label>
            <InputText
              id="Poscode"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.Poscode}
              onChange={(e) => setValByKey("Poscode", e.target.value)}
            />
          </span>
          <small className="p-error">
            {error["Poscode"] && (
              <p className="m-0" key="error-Poscode">
                {error["Poscode"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="City">City:</label>
            <InputText
              id="City"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.City}
              onChange={(e) => setValByKey("City", e.target.value)}
            />
          </span>
          <small className="p-error">
            {error["City"] && (
              <p className="m-0" key="error-City">
                {error["City"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-4 field">
          <span className="align-items-center">
            <label htmlFor="State">State:</label>
            <InputText
              id="State"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.State}
              onChange={(e) => setValByKey("State", e.target.value)}
            />
          </span>
          <small className="p-error">
            {error["State"] && (
              <p className="m-0" key="error-State">
                {error["State"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-4 field">
          <span className="align-items-center">
            <label htmlFor="Province">Province:</label>
            <InputText
              id="Province"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.Province}
              onChange={(e) => setValByKey("Province", e.target.value)}
            />
          </span>
          <small className="p-error">
            {error["Province"] && (
              <p className="m-0" key="error-Province">
                {error["Province"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-4 field">
          <span className="align-items-center">
            <label htmlFor="Country">Country:</label>
            <Dropdown
              id="Country"
              value={_entity?.Country}
              optionLabel="name"
              optionValue="value"
              options={countryOptions}
              onChange={(e) => setValByKey("Country", e.value)}
              placeholder="Select a country"
              className="w-full"
              filter
              showClear
            />
          </span>
          <small className="p-error">
            {error["Country"] && (
              <p className="m-0" key="error-Country">
                {error["Country"]}
              </p>
            )}
          </small>
        </div>
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
)(UserAddressesCreateDialogComponent);
