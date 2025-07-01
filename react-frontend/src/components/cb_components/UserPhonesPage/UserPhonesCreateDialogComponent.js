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
import { Checkbox } from "primereact/checkbox";
const typeArray = ["Land line", "Mobile", "Fax", "WA Only", "SMS Only"];
const typeOptions = typeArray.map((x) => ({ name: x, value: x }));
import countries from "../../../resources/countries.json";
import { AsYouType, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { getSchemaValidationErrorsStrings, updateMany } from "../../../utils";

const UserPhonesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [userId, setUserId] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [exampleNumber, setExampleNumber] = useState("");

  countries.sort((a, b) => a.name.localeCompare(b.name));

  // Update example number when country changes
  useEffect(() => {
    if (selectedCountry) {
      try {
        const example = getExampleNumber(selectedCountry.code, examples);
        if (example) {
          setExampleNumber(example.formatNational());
        } else {
          setExampleNumber(`Enter ${selectedCountry.name} phone number`);
        }
      } catch (e) {
        setExampleNumber(`Enter ${selectedCountry.name} phone number`);
      }
    } else {
      setExampleNumber("Select a country first");
    }
  }, [selectedCountry]);

  useEffect(() => {
    let init = { isDefault: false };

    if (!_.isEmpty(props?.entity)) {
      init = initilization({ ...props?.entity, ...init }, [userId], setError);
    }
    set_entity({ ...init });
  }, [props.show]);

  useEffect(() => {
    set_entity({});
  }, [props.onHide]);

  // Handle phone number input changes
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    setPhoneInput(value);

    if (selectedCountry) {
      const formatter = new AsYouType(selectedCountry.code);
      const formatted = formatter.input(value);
      setFormattedPhone(formatted);

      // Get the parsed phone number
      const phoneNumber = formatter.getNumber();
      if (phoneNumber) {
        set_entity({
          ..._entity,
          countryCode: phoneNumber.countryCallingCode,
          operatorCode: phoneNumber.nationalNumber.substring(0, 3),
          number: phoneNumber.number,
        });
      } else {
        // Clear entity if number becomes invalid
        set_entity({
          ..._entity,
          countryCode: undefined,
          operatorCode: undefined,
          number: undefined,
        });
      }
    }
  };

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.number)) {
      error["number"] = `Phone number is required`;
      ret = false;
    } else if (selectedCountry) {
      const formatter = new AsYouType(selectedCountry.code);
      formatter.input(phoneInput);
      const phoneNumber = formatter.getNumber();

      if (!phoneNumber || !phoneNumber.isPossible()) {
        error["number"] = `Invalid phone number for ${selectedCountry.name}`;
        ret = false;
      }
    }

    if (_.isEmpty(_entity?.userId)) {
      error["userId"] = `User is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.type)) {
      error["type"] = `Phone type is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.countryCode)) {
      error["countryCode"] = `Phone Country Code is required`;
      ret = false;
    }

    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;

    let _data = {
      userId: _entity?.userId?._id,
      countryCode: _entity?.countryCode,
      operatorCode: _entity?.operatorCode,
      number: _entity?.number,
      type: _entity?.type,
      isDefault: _entity?.isDefault || false,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    if (_entity?.isDefault) {
      const updated = await updateMany({
        collection: "user_phones",
        query: {
          type: _entity?.type,
          userId: _entity?.userId?._id,
        },
        update: { isDefault: false },
        user: props.user,
      });
    } else {
      const validResult = await client.service("userPhones").find({
        query: { type: _entity?.type, userId: _entity?.userId?._id },
      });
      if (validResult.total <= 1) _entity.isDefault = true;
    }

    try {
      const result = await client.service("userPhones").create(_data);
      const eagerResult = await client.service("userPhones").find({
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
        message: "Info User Phones updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in User Phones",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
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

  const selectedCountryTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <img
            alt={option.name}
            src={`assets/png100px/${option.code.toLowerCase()}.png`}
            className={`mr-2 flag flag-${option.code.toLowerCase()}`}
            style={{ width: "18px" }}
          />
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const countryOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <img
          alt={option.name}
          src={`assets/png100px/${option.code.toLowerCase()}.png`}
          className={`mr-2 flag flag-${option.code.toLowerCase()}`}
          style={{ width: "18px" }}
        />
        <div>{option.name}</div>
      </div>
    );
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

  const userIdOptions = userId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Add User Phone"
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
        role="userPhones-create-dialog-component"
      >
        <div className="col-12 field">
          <span className="align-items-center">
            <label htmlFor="userId">User:</label>
            <Dropdown
              id="userId"
              value={_entity?.userId?._id}
              optionLabel="name"
              optionValue="value"
              options={userIdOptions}
              onChange={(e) => setValByKey("userId", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["userId"]) ? (
              <p className="m-0" key="error-userId">
                {error["userId"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-4">
          <span className="align-items-center">
            <label htmlFor="country" className="font-bold block mb-2">
              Country:
            </label>
            <Dropdown
              id="country"
              key="country"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.value);
                setPhoneInput("");
                setFormattedPhone("");
              }}
              options={countries}
              optionLabel="name"
              placeholder="Select a Country"
              filter
              valueTemplate={selectedCountryTemplate}
              itemTemplate={countryOptionTemplate}
              className="w-full md:w-14rem"
            />
          </span>
          {selectedCountry && (
            <small className="text-500">
              Country code: +{selectedCountry.callingCode}
            </small>
          )}
          <small className="p-error">
            {!_.isEmpty(error["countryCode"]) ? (
              <p className="m-0" key="error-countryCode">
                {error["countryCode"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-6 field">
          <span className="align-items-center">
            <label htmlFor="phone" className="font-bold block mb-2">
              Phone Number:
            </label>
            <div className="p-inputgroup">
              {selectedCountry && (
                <span className="p-inputgroup-addon">
                  +{selectedCountry.callingCode}
                </span>
              )}
              <InputText
                id="phone"
                value={formattedPhone}
                onChange={handlePhoneInput}
                disabled={!selectedCountry}
                placeholder={exampleNumber}
                className={!selectedCountry ? "p-disabled" : ""}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["number"]) ? (
              <p className="m-0" key="error-number">
                {error["number"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-4 field">
          <span className="align-items-center">
            <label htmlFor="type">Type:</label>
            <Dropdown
              id="type"
              value={_entity?.type}
              options={typeOptions}
              optionLabel="name"
              optionValue="value"
              onChange={(e) => setValByKey("type", e.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["type"]) ? (
              <p className="m-0" key="error-type">
                {error["type"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="number">Dialing Number:</label>
            <InputText
              id="number"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.number || ""}
              disabled={true}
            />
          </span>
        </div>

        <div className="col-12 md:col-2 field flex">
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

export default connect(mapState, mapDispatch)(UserPhonesCreateDialogComponent);
