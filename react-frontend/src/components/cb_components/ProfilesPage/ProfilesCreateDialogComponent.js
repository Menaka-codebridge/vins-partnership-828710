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
import { Chips } from "primereact/chips";
import { CascadeSelect } from "primereact/cascadeselect";
import UserAddressesCreateDialogComponent from "../UserAddressesPage/UserAddressesCreateDialogComponent";
import UserPhonesCreateDialogComponent from "../UserPhonesPage/UserPhonesCreateDialogComponent";
import CompaniesCreateDialogComponent from "../CompaniesPage/CompaniesCreateDialogComponent";
import BranchesCreateDialogComponent from "../BranchesPage/BranchesCreateDialogComponent";
import DepartmentsCreateDialogComponent from "../DepartmentsPage/DepartmentsCreateDialogComponent";
import SectionsCreateDialogComponent from "../SectionsPage/SectionsCreateDialogComponent";
import CompanyPositionMappingsCreateDialogComponent from "../CompanyPositionMappingsPage/CompanyPositionMappingsCreateDialogComponent";
import UploadFilesToS3 from "../../../services/UploadFilesToS3";
import { getSchemaValidationErrorsStrings } from "../../../utils";

const ProfilesCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [userId, setUserId] = useState([]);
  const [department, setDepartment] = useState([]);
  const [section, setSection] = useState([]);
  const [position, setPosition] = useState([]);
  const [manager, setManager] = useState([]);
  const [company, setCompany] = useState([]);
  const [branch, setBranch] = useState([]);
  const [address, setAddress] = useState([]);
  const [phone, setPhone] = useState([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({});
  const [newRecord, setRecord] = useState({});
  const [data, setData] = useState([]);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showPositionMappingDialog, setShowPositionMappingDialog] =
    useState(false);
  const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);
  const [validPositionIds, setValidPositionIds] = useState([]);

  useEffect(() => {
    let init = { hod: false, hos: false };
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [
          userId,
          department,
          section,
          positionsRolesOptions,
          manager,
          company,
          branch,
          address,
          phone,
        ],
        setError,
      );
    }
    set_entity({ ...init });
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.name)) {
      error["name"] = `Name field is required`;
      ret = false;
    }
    if (_.isEmpty(_entity?.position)) {
      error["position"] = `Position field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.company)) {
      error["company"] = `Company field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      name: _entity?.name,
      userId: _entity?.userId?._id,
      image: _entity?.image,
      bio: _entity?.bio,
      department: _entity?.department?._id,
      hod: _entity?.hod || false,
      section: _entity?.section?._id,
      hos: _entity?.hos || false,
      position: _entity?.position?.positionID,
      role: _entity?.position?.roleID,
      manager: _entity?.manager?._id,
      company: _entity?.company?._id,
      branch: _entity?.branch?._id,
      skills: _entity?.skills,
      address: _entity?.address?._id,
      phone: _entity?.phone?._id,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("profiles").create(_data);
      const eagerResult = await client.service("profiles").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "userId",
              service: "users",
              select: ["name"],
            },
            {
              path: "department",
              service: "departments",
              select: ["name"],
            },
            {
              path: "section",
              service: "sections",
              select: ["name"],
            },
            {
              path: "position",
              service: "positions",
              select: ["name"],
            },
            {
              path: "company",
              service: "companies",
              select: ["name"],
            },
            {
              path: "branch",
              service: "branches",
              select: ["name"],
            },
            {
              path: "address",
              service: "userAddresses",
              select: ["Street1"],
            },
            {
              path: "phone",
              service: "userPhones",
              select: ["number"],
            },
          ],
        },
      });
      const imageId = result.image[0];

      const documentStorage = await client.service("documentStorages").find({
        query: {
          _id: imageId,
        },
      });

      if (documentStorage.data.length > 0) {
        const docToUpdate = documentStorage.data[0];

        await client.service("documentStorages").patch(docToUpdate._id, {
          tableId: result._id,
        });
      } else {
        console.log("No matching document found in documentStorages.");
      }

      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info Profiles updated successfully",
      });
      // props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.debug("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Profiles",
      });
    }
    setLoading(false);
  };

  const setimageId = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for 10ms
    setValByKey("image", id);
  };

  useEffect(() => {
    // on mount users
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
        setManager(
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

  useEffect(() => {
    // on mount departments
    client
      .service("departments")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleDepartmentsId,
        },
      })
      .then((res) => {
        setDepartment(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Departments",
          type: "error",
          message: error.message || "Failed get departments",
        });
      });
  }, [showDepartmentDialog]);

  useEffect(() => {
    // on mount sections
    client
      .service("sections")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleSectionsId,
        },
      })
      .then((res) => {
        setSection(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Sections",
          type: "error",
          message: error.message || "Failed get sections",
        });
      });
  }, [showSectionDialog]);

  useEffect(() => {
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
          name: role.name,
          code: role._id,
          items: [],
        }));

        client
          .service("positions")
          .find({
            query: {
              $limit: 10000,
              $sort: { createdAt: -1 },
            },
          })
          .then((positionsRes) => {
            positionsRes.data.forEach((position) => {
              const role = formattedRoles.find(
                (r) => r.code === position.roleId,
              );
              if (role) {
                role.items.push({
                  name: position.name,
                  code: position._id,
                  positionID: position._id,
                  roleID: position.roleId,
                });
              }
            });
            setPositionsRolesOptions(formattedRoles);
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
  }, [showPositionMappingDialog]);

  useEffect(() => {
    // on mount companies
    client
      .service("companies")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleCompaniesId,
        },
      })
      .then((res) => {
        setCompany(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.debug({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed get companies",
        });
      });
  }, []);

  const handleCompanyChange = (e) => {
    const selectedCompanyId = e.value;
    set_entity((prev) => ({
      ...prev,
      company: { _id: selectedCompanyId },
      branch: null,
      position: null,
    }));
    setBranch([]);
    setPositionsRolesOptions([]);
    setValidPositionIds([]);

    // Fetch branches for the selected company
    client
      .service("branches")
      .find({
        query: {
          companyId: selectedCompanyId,
          $limit: 10000,
          $sort: { createdAt: -1 },
        },
      })
      .then((res) => {
        setBranch(res.data.map((b) => ({ name: b.name, value: b._id })));
      })
      .catch((error) => props.alert({ type: "error", message: error.message }));

    // Fetch companyPositionMappings to get valid positions
    client
      .service("companyPositionMappings")
      .find({
        query: {
          company: selectedCompanyId,
          $limit: 1,
        },
      })
      .then((res) => {
        const positionIds = res.data[0]?.position || [];
        setValidPositionIds(positionIds);

        // Fetch roles and positions, then filter positions based on validPositionIds
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
              name: role.name,
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
                      name: position.name,
                      code: position._id,
                      positionID: position._id,
                      roleID: position.roleId,
                    });
                  }
                });
                setPositionsRolesOptions(
                  formattedRoles.filter((role) => role.items.length > 0),
                );
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
    // on mount userAddresses
    client
      .service("userAddresses")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          userId: props.user._id,
        },
      })
      .then((res) => {
        setAddress(
          res.data.map((e) => {
            return { name: e["Street1"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "UserAddresses",
          type: "error",
          message: error.message || "Failed get userAddresses",
        });
      });
  }, [showAddressDialog]);

  useEffect(() => {
    // on mount userPhones
    client
      .service("userPhones")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleUserPhonesId,
        },
      })
      .then((res) => {
        setPhone(
          res.data.map((e) => {
            return { name: e["number"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "UserPhones",
          type: "error",
          message: error.message || "Failed get userPhones",
        });
      });
  }, [showPhoneDialog]);

  useEffect(() => {
    handleCompanyChange;
  }, [showPositionMappingDialog]);

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
  const managerOptions = manager.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const addressOptions = address.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const phoneOptions = phone.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  const handleCreateAddress = async () => {
    try {
      const newAddressData = {
        ...newAddress,
        userId: urlParams.singleUsersId,
      };
      const createdAddress = await client
        .service("userAddresses")
        .create(newAddressData);

      setAddress([
        ...address,
        { name: createdAddress.Street1, value: createdAddress._id },
      ]);

      setValByKey("address", { _id: createdAddress._id });
      setShowAddressDialog(false);
      setNewAddress({});
    } catch (error) {
      console.error("Error creating address:", error);
      props.alert({
        type: "error",
        title: "Error",
        message: "Failed to create address",
      });
    }
  };
  const onCreateResult = (newEntity) => {
    setData([...data, newEntity]);
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
              name: role.name,
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
                      name: position.name,
                      code: position._id,
                      positionID: position._id,
                      roleID: position.roleId,
                    });
                  }
                });
                setPositionsRolesOptions(
                  formattedRoles.filter((role) => role.items.length > 0),
                );
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
    // Refresh positions after creating a position mapping
    if (_entity?.company?._id && !showPositionMappingDialog) {
      fetchPositionsForCompany(_entity.company._id);
    }
  }, [showPositionMappingDialog]);

  return (
    <Dialog
      header="Create Profiles"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="profiles-create-dialog-component"
      >
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="name">Name:</label>
            <InputText
              id="name"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.name}
              onChange={(e) => setValByKey("name", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["name"]) ? (
              <p className="m-0" key="error-name">
                {error["name"]}
              </p>
            ) : null}
          </small>
        </div>
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
        <div className="col-12  field">
          <span className="align-items-center">
            <label htmlFor="bio">Bio:</label>
            <InputTextarea
              id="bio"
              rows={5}
              cols={30}
              value={_entity?.bio}
              onChange={(e) => setValByKey("bio", e.target.value)}
              autoResize
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["bio"]) ? (
              <p className="m-0" key="error-bio">
                {error["bio"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 field">
          <span className="align-items-center">
            <label htmlFor="skills">Skills:</label>
            <Chips
              id="skills"
              className="w-full mb-3"
              value={_entity?.skills}
              onChange={(e) => setValByKey("skills", e.target.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["skills"]) ? (
              <p className="m-0" key="error-skills">
                {error["skills"]}
              </p>
            ) : null}
          </small>
        </div>
        {/* <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="image">Image:</label>
            <UploadFilesToS3
              type={"create"}
              user={props.user}
              id={urlParams.id}
              serviceName="profiles"
              onUploadComplete={setimageId}
              // onFileLoaded={onFileimageLoaded}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["image"]) ? (
              <p className="m-0" key="error-image">
                {error["image"]}
              </p>
            ) : null}
          </small>
        </div> */}
        <div className="col-12 md:col-6 field">
          <label htmlFor="company">Company</label>
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
          <label htmlFor="branch">Branch</label>
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
        </div>
        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="position">Position and Role:</label>
            <div className="flex align-items-center">
              {validPositionIds.length > 0 || !_entity?.company?._id ? (
                <div className="w-full">
                  <CascadeSelect
                    id="position"
                    value={_entity?.position}
                    options={positionsRolesOptions}
                    optionLabel="name"
                    optionGroupLabel="name"
                    optionGroupChildren={["items"]}
                    style={{ minWidth: "14rem", width: "100%" }}
                    placeholder={
                      !_entity?.company?._id
                        ? "Select a company first"
                        : validPositionIds.length === 0
                          ? "No positions available"
                          : "Select a Position"
                    }
                    onChange={(e) => setValByKey("position", e.value)}
                    disabled={
                      !_entity?.company?._id || validPositionIds.length === 0
                    }
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
          </span>
          {error.position && (
            <small className="p-error">{error.position}</small>
          )}
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="manager">Manager:</label>
          <Dropdown
            id="manager"
            value={_entity?.manager?._id}
            optionLabel="name"
            optionValue="value"
            options={managerOptions}
            onChange={(e) => setValByKey("manager", { _id: e.value })}
          />

          <small className="p-error">
            {!_.isEmpty(error["manager"]) ? (
              <p className="m-0" key="error-manager">
                {error["manager"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field flex">
          <span className="align-items-center">
            <label htmlFor="hod">Head of Department:</label>
            <Checkbox
              id="hod"
              className="ml-3"
              checked={_entity?.hod}
              onChange={(e) => setValByKey("hod", e.checked)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["hod"]) ? (
              <p className="m-0" key="error-hod">
                {error["hod"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-6 field flex">
          <span className="align-items-center">
            <label htmlFor="hos">Head of Section:</label>
            <Checkbox
              id="hos"
              className="ml-3"
              checked={_entity?.hos}
              onChange={(e) => setValByKey("hos", e.checked)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["hos"]) ? (
              <p className="m-0" key="error-hos">
                {error["hos"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="address">Address:</label>
            <div className="flex align-items-center">
              {addressOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="address"
                    value={_entity?.address?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={addressOptions}
                    onChange={(e) => setValByKey("address", { _id: e.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              ) : (
                <div>No addresses found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowAddressDialog(true)}
                tooltip="Add Address"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["address"]) ? (
              <p className="m-0" key="error-address">
                {error["address"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="phone">Phone:</label>
            <div className="flex align-items-center">
              {phoneOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="phone"
                    value={_entity?.phone?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={phoneOptions}
                    onChange={(e) => setValByKey("phone", { _id: e.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              ) : (
                <div>No phone numbers found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowPhoneDialog(true)}
                tooltip="Add Phone"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>

          <small className="p-error">
            {!_.isEmpty(error["phone"]) ? (
              <p className="m-0" key="error-phone">
                {error["phone"]}
              </p>
            ) : null}
          </small>
        </div>
      </div>

      <UserAddressesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showAddressDialog}
        onHide={() => setShowAddressDialog(false)}
      />

      <UserPhonesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showPhoneDialog}
        onHide={() => setShowPhoneDialog(false)}
      />

      <CompaniesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showCompanyDialog}
        onHide={() => setShowCompanyDialog(false)}
      />

      <BranchesCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showBranchDialog}
        onHide={() => setShowBranchDialog(false)}
      />
      <DepartmentsCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showDepartmentDialog}
        onHide={() => setShowDepartmentDialog(false)}
      />
      <SectionsCreateDialogComponent
        entity={newRecord}
        onCreateResult={onCreateResult}
        show={showSectionDialog}
        onHide={() => setShowSectionDialog(false)}
      />
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

export default connect(mapState, mapDispatch)(ProfilesCreateDialogComponent);
