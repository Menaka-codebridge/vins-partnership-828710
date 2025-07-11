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
import UserAddressesCreateDialogComponent from "../UserAddressesPage/UserAddressesCreateDialogComponent";
import UserPhonesCreateDialogComponent from "../UserPhonesPage/UserPhonesCreateDialogComponent";
import CompaniesCreateDialogComponent from "../CompaniesPage/CompaniesCreateDialogComponent";
import BranchesCreateDialogComponent from "../BranchesPage/BranchesCreateDialogComponent";
import DepartmentsCreateDialogComponent from "../DepartmentsPage/DepartmentsCreateDialogComponent";
import SectionsCreateDialogComponent from "../SectionsPage/SectionsCreateDialogComponent";
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
  const [newRecord, setRecord] = useState({});
  const [data, setData] = useState([]);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  useEffect(() => {
    let init = { hod: false, hos: false };
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [
          userId,
          department,
          section,
          position,
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

    // if (_.isEmpty(_entity?.image)) {
    //   error["image"] = `Image field is required`;
    //   ret = false;
    // }

    // if (_.isEmpty(_entity?.department)) {
    //   error["department"] = `Department field is required`;
    //   ret = false;
    // }

    if (_.isEmpty(_entity?.position)) {
      error["position"] = `Position field is required`;
      ret = false;
    }

    // if (_.isEmpty(_entity?.company)) {
    //   error["company"] = `Company field is required`;
    //   ret = false;
    // }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    const positionData = await client
      .service("positions")
      .get(_entity.position._id);
    const roleId = positionData.roleId;
    setLoading(true);

    try {
      if (_entity.image) {
        setimageId(_entity.image);
      }

      let _data = {
        name: _entity?.name,
        userId: props.user._id,
        image: _entity?.image,
        bio: _entity?.bio,
        department: _entity?.department?._id,
        hod: _entity?.hod || false,
        section: _entity?.section?._id,
        hos: _entity?.hos || false,
        role: roleId,
        position: _entity?.position?._id,
        manager: _entity?.manager?._id,
        company: _entity?.company?._id,
        branch: _entity?.branch?._id,
        skills: _entity?.skills,
        address: _entity?.address?._id,
        phone: _entity?.phone?._id,
        createdBy: props.user._id,
        updatedBy: props.user._id,
      };

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

      // props.onCreateResult(result);

      props.alert({
        type: "success",
        title: "Create profiles",
        message: "Profiles updated successfully",
      });

      // props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Profiles",
      });
    } finally {
      setLoading(false);
    }
  };

  // const setimageId = (id) => {
  //   setValByKey("image", id);
  // };

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
      })
      .catch((error) => {
        console.log({ error });
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
    // on mount positions
    client
      .service("positions")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singlePositionsId,
        },
      })
      .then((res) => {
        setPosition(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Positions",
          type: "error",
          message: error.message || "Failed get positions",
        });
      });
  }, []);

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
        console.log({ error });
        props.alert({
          title: "Companies",
          type: "error",
          message: error.message || "Failed get companies",
        });
      });
  }, [showCompanyDialog]);

  useEffect(() => {
    // on mount branches
    client
      .service("branches")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleBranchesId,
        },
      })
      .then((res) => {
        setBranch(
          res.data.map((e) => {
            return { name: e["name"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Branches",
          type: "error",
          message: error.message || "Failed get branches",
        });
      });
  }, [showBranchDialog]);

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
  const departmentOptions = department.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const sectionOptions = section.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const positionOptions = position.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const managerOptions = manager.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const companyOptions = company.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const branchOptions = branch.map((elem) => ({
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

  const onCreateResult = (newEntity) => {
    setData([...data, newEntity]);
  };

  return (
    <Dialog
      header="Create Profiles"
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
        <div className="col-12 md:col-6 field">
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
        </div>
        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="company">Company:</label>
            <div className="flex align-items-center">
              {companyOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="company"
                    value={_entity?.company?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={companyOptions}
                    onChange={(e) => setValByKey("company", { _id: e.value })}
                    required
                  />
                </div>
              ) : (
                <div>No companies found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowCompanyDialog(true)}
                tooltip="Add Company"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["company"]) ? (
              <p className="m-0" key="error-company">
                {error["company"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="branch">Branch:</label>
            <div className="flex align-items-center">
              {branchOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="branch"
                    value={_entity?.branch?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={branchOptions}
                    onChange={(e) => setValByKey("branch", { _id: e.value })}
                  />
                </div>
              ) : (
                <div>No branches found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowBranchDialog(true)}
                tooltip="Add Branch"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["branch"]) ? (
              <p className="m-0" key="error-branch">
                {error["branch"]}
              </p>
            ) : null}
          </small>
        </div>
        {/* <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="department">Department:</label>
            <div className="flex align-items-center">
              {departmentOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="department"
                    value={_entity?.department?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={departmentOptions}
                    onChange={(e) =>
                      setValByKey("department", { _id: e.value })
                    }
                    required
                  />
                </div>
              ) : (
                <div>No departments found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowDepartmentDialog(true)}
                tooltip="Add Department"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["department"]) ? (
              <p className="m-0" key="error-department">
                {error["department"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="flex flex-col">
            <label htmlFor="section">Section:</label>
            <div className="flex align-items-center">
              {sectionOptions.length > 0 ? (
                <div className="w-full">
                  <Dropdown
                    id="section"
                    value={_entity?.section?._id}
                    optionLabel="name"
                    optionValue="value"
                    options={sectionOptions}
                    onChange={(e) => setValByKey("section", { _id: e.value })}
                  />
                </div>
              ) : (
                <div>No sections found</div>
              )}
              <Button
                icon="pi pi-plus"
                className="p-button-text no-focus-effect ml-2"
                onClick={() => setShowSectionDialog(true)}
                tooltip="Add Section"
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </span>
          <small className="p-error">
            {!_.isEmpty(error["section"]) ? (
              <p className="m-0" key="error-section">
                {error["section"]}
              </p>
            ) : null}
          </small>
        </div> */}
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="position">Position:</label>
            <Dropdown
              id="position"
              value={_entity?.position?._id}
              optionLabel="name"
              optionValue="value"
              options={positionOptions}
              onChange={(e) => setValByKey("position", { _id: e.value })}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["position"]) ? (
              <p className="m-0" key="error-position">
                {error["position"]}
              </p>
            ) : null}
          </small>
        </div>
        {/* <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="manager">Manager:</label>
            <Dropdown
              id="manager"
              value={_entity?.manager?._id}
              optionLabel="name"
              optionValue="value"
              options={managerOptions}
              onChange={(e) => setValByKey("manager", { _id: e.value })}
            />
          </span>
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
        </div> */}

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
