import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Chip } from "primereact/chip";
import CompanyPositionMappingsCreateDialogComponent from "../CompanyPositionMappingsPage/CompanyPositionMappingsCreateDialogComponent";
import { getSchemaValidationErrorsStrings } from "../../../utils";

const UserInvitesEditDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);
  const [validPositionIds, setValidPositionIds] = useState([]);
  const [company, setCompany] = useState([]);
  const [branch, setBranch] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPositionMappingDialog, setShowPositionMappingDialog] =
    useState(false);
  const [newRecord, setNewRecord] = useState({});

  useEffect(() => {
    if (props.entity) {
      set_entity({
        ...props.entity,
        emailToInvite: props.entity.emailToInvite || "",
        sendMailCounter: props.entity.sendMailCounter || 0,
        positions: props.entity.positions || [],
        roles: props.entity.roles || [],
        company: props.entity.company || null,
        branch: props.entity.branch || null,
      });
      if (props.entity.company?._id) {
        fetchPositionsForCompany(props.entity.company._id);
      }
    }
  }, [props.entity, props.show]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.emailToInvite)) {
      error["emailToInvite"] = `Invitation Email field is required`;
      ret = false;
    } else if (!validateEmail(_entity?.emailToInvite)) {
      error["emailToInvite"] = `Invitation Email is not valid`;
      ret = false;
    }
    if (selectedItems.length === 0) {
      error["positions"] = `At least one position is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      emailToInvite: _entity?.emailToInvite,
      sendMailCounter: _entity?.sendMailCounter,
      code: _entity?.code,
      positions: selectedItems.map((item) => item.positionId),
      roles: selectedItems.map((item) => item.roleId),
      company: _entity?.company?._id,
      branch: _entity?.branch?._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client
        .service("userInvites")
        .patch(_entity._id, _data);
      const eagerResult = await client.service("userInvites").find({
        query: {
          $limit: 1,
          _id: _entity._id,
          $populate: [
            { path: "company", service: "companies", select: ["name"] },
            { path: "branch", service: "branches", select: ["name"] },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Edit User Invite",
        message: "User Invite updated successfully",
      });
      props.onEditResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to update");
      props.alert({
        type: "error",
        title: "Edit User Invite",
        message: "Failed to update User Invite",
      });
    }
    setLoading(false);
  };

  const fetchPositionsForCompany = (companyId) => {
    setPositionsRolesOptions([]);
    setValidPositionIds([]);

    client
      .service("companyPositionMappings")
      .find({
        query: {
          company: companyId,
          $limit: 1,
        },
      })
      .then((res) => {
        const positionIds = res.data[0]?.position || [];
        setValidPositionIds(positionIds);

        client
          .service("roles")
          .find({
            query: {
              $limit: 10000,
              $sort: { createdAt: -1 },
            },
          })
          .then((rolesRes) => {
            const formattedRoles = rolesRes.data.map((role) => ({
              label: role.name,
              code: role._id,
              items: [],
            }));

            client
              .service("positions")
              .find({
                query: {
                  $limit: 10000,
                  $sort: { createdAt: -1 },
                  _id: { $in: positionIds },
                },
              })
              .then((positionsRes) => {
                positionsRes.data.forEach((position) => {
                  const role = formattedRoles.find(
                    (r) => r.code === position.roleId,
                  );
                  if (role) {
                    role.items.push({
                      label: position.name,
                      value: position._id,
                      positionID: position._id,
                      roleID: position.roleId,
                    });
                  }
                });
                setPositionsRolesOptions(
                  formattedRoles.filter((role) => role.items.length > 0),
                );

                // Initialize selectedItems for existing positions
                if (_entity.positions && _entity.roles) {
                  const items = _entity.positions.map((position, index) => {
                    const positionId =
                      typeof position === "object" ? position._id : position;
                    const roleId = _entity.roles[index];
                    const role = formattedRoles.find((r) => r.code === roleId);
                    const pos = role?.items.find((p) => p.value === positionId);
                    return {
                      positionId,
                      roleId,
                      positionName: pos?.label || "Unknown Position",
                      roleName: role?.label || "Unknown Role",
                    };
                  });
                  setSelectedItems(
                    items.filter(
                      (item) => item.positionName !== "Unknown Position",
                    ),
                  );
                }
              })
              .catch((error) => {
                console.error({ error });
                props.alert({
                  title: "Positions",
                  type: "error",
                  message: error.message || "Failed to fetch positions",
                });
              });
          })
          .catch((error) => {
            console.error({ error });
            props.alert({
              title: "Roles",
              type: "error",
              message: error.message || "Failed to fetch roles",
            });
          });
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "CompanyPositionMappings",
          type: "error",
          message: error.message || "Failed to fetch company position mappings",
        });
      });
  };

  useEffect(() => {
    if (_entity?.company?._id && !showPositionMappingDialog) {
      fetchPositionsForCompany(_entity.company._id);
    }
  }, [_entity?.company?._id, showPositionMappingDialog]);

  useEffect(() => {
    client
      .service("companies")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          ...(urlParams.singleCompaniesId && {
            _id: urlParams.singleCompaniesId,
          }),
        },
      })
      .then((res) => {
        setCompany(res.data.map((e) => ({ name: e.name, value: e._id })));
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed to fetch companies",
        });
      });
  }, []);

  useEffect(() => {
    if (_entity?.company?._id) {
      client
        .service("branches")
        .find({
          query: {
            companyId: _entity.company._id,
            $limit: 10000,
            $sort: { createdAt: -1 },
          },
        })
        .then((res) => {
          setBranch(res.data.map((b) => ({ name: b.name, value: b._id })));
        })
        .catch((error) => {
          props.alert({
            type: "error",
            message: error.message || "Failed to fetch branches",
          });
        });
    } else {
      setBranch([]);
    }
  }, [_entity?.company?._id]);

  const handleCompanyChange = (e) => {
    const selectedCompanyId = e.value;
    set_entity((prev) => ({
      ...prev,
      company: { _id: selectedCompanyId },
      branch: null,
    }));
    setBranch([]);
    setSelectedItems([]);
    setPositionsRolesOptions([]);
    setValidPositionIds([]);
    fetchPositionsForCompany(selectedCompanyId);
  };

  const handleMultiSelectChange = (e) => {
    const selectedPositionIds = e.value;
    const newSelectedItems = [];

    selectedPositionIds.forEach((positionId) => {
      const role = positionsRolesOptions.find((r) =>
        r.items.some((p) => p.value === positionId),
      );
      const position = role?.items.find((p) => p.value === positionId);
      if (position && role) {
        newSelectedItems.push({
          positionId: position.positionID,
          roleId: position.roleID,
          positionName: position.label,
          roleName: role.label,
        });
      }
    });

    setSelectedItems(newSelectedItems);
  };

  const handleRemoveSelectedItem = (item) => {
    setSelectedItems((prev) =>
      prev.filter((i) => i.positionId !== item.positionId),
    );
  };

  const renderSelectedItems = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedItems.map((item, index) => (
          <Chip
            key={index}
            label={`${item.positionName} (${item.roleName})`}
            removable
            onRemove={() => handleRemoveSelectedItem(item)}
          />
        ))}
      </div>
    );
  };

  const groupTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
      </div>
    );
  };

  const onCreateResult = (newEntity) => {
    if (newEntity.position) {
      if (_entity?.company?._id) {
        fetchPositionsForCompany(_entity.company._id);
      }
      setShowPositionMappingDialog(false);
      props.alert({
        type: "success",
        title: "Create Position Mapping",
        message: "Position mapping created successfully",
      });
    }
  };

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
    set_entity((prev) => ({ ...prev, [key]: val }));
    setError((prev) => ({ ...prev, [key]: null }));
  };

  return (
    <Dialog
      header="Edit User Invite"
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
        role="userInvites-edit-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-2">
          <span className="align-items-center">
            <label htmlFor="emailToInvite">Invitation Email:</label>
            <InputText
              id="emailToInvite"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.emailToInvite || ""}
              onChange={(e) => setValByKey("emailToInvite", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["emailToInvite"]) && (
              <p className="m-0" key="error-emailToInvite">
                {error["emailToInvite"]}
              </p>
            )}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-2">
          <span className="align-items-center">
            <label htmlFor="sendMailCounter">Send Mail Counter:</label>
            <InputNumber
              id="sendMailCounter"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.sendMailCounter || 0}
              useGrouping={false}
              onChange={(e) => setValByKey("sendMailCounter", e.value)}
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="company">Company:</label>
          <Dropdown
            id="company"
            value={_entity?.company?._id || null}
            options={company}
            onChange={handleCompanyChange}
            optionLabel="name"
            placeholder="Select a company"
          />
          {error.company && <small className="p-error">{error.company}</small>}
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="branch">Branch:</label>
          <Dropdown
            id="branch"
            value={_entity?.branch?._id || null}
            options={branch}
            onChange={(e) =>
              set_entity({ ..._entity, branch: { _id: e.value } })
            }
            optionLabel="name"
            placeholder="Select a branch"
            disabled={!branch.length}
          />
          {error.branch && <small className="p-error">{error.branch}</small>}
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="position">Role and Position:</label>
          <div className="flex align-items-center">
            {validPositionIds.length > 0 || !_entity?.company?._id ? (
              <div className="w-full">
                <MultiSelect
                  id="position"
                  value={selectedItems.map((item) => item.positionId)}
                  options={positionsRolesOptions}
                  optionLabel="label"
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  optionGroupTemplate={groupTemplate}
                  style={{ minWidth: "14rem", width: "100%" }}
                  placeholder={
                    !_entity?.company?._id
                      ? "Select a company first"
                      : validPositionIds.length === 0
                        ? "No positions available"
                        : "Select Positions"
                  }
                  onChange={handleMultiSelectChange}
                  disabled={
                    !_entity?.company?._id || validPositionIds.length === 0
                  }
                  display="chip"
                />
              </div>
            ) : (
              <div>No positions available</div>
            )}
            {validPositionIds.length === 0 && (
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowPositionMappingDialog(true)}
                tooltip="Add Position Mapping"
                tooltipOptions={{ position: "bottom" }}
                disabled={!_entity?.company?._id}
              />
            )}
          </div>
          <small className="p-error">
            {!_.isEmpty(error["positions"]) && (
              <p className="m-0" key="error-positions">
                {error["positions"]}
              </p>
            )}
          </small>
        </div>
      </div>
      <CompanyPositionMappingsCreateDialogComponent
        entity={newRecord}
        show={showPositionMappingDialog}
        onHide={() => setShowPositionMappingDialog(false)}
        onCreateResult={onCreateResult}
      />
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

export default connect(mapState, mapDispatch)(UserInvitesEditDialogComponent);
