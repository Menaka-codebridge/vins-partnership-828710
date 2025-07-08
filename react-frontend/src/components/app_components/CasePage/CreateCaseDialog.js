import React, { useState, useRef } from "react";
import { connect } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Steps } from "primereact/steps";
import { Message } from "primereact/message";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import client from "../../../services/restClient";
import UploadFilesToS3 from "../../../services/UploadFilesToS3";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

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
  return Object.keys(errMsg).length > 0
    ? errMsg
    : errorObj.message
      ? { error: errorObj.message }
      : {};
};

const CreateCaseDialogStyled = (props) => {
  const synonymousList = [
    { primary: "represent", synonyms: "warrant, covenant, undertake" },
    {
      primary: "representation",
      synonyms: "warranty, covenant, undertaking, assurance, guarantee",
    },
    { primary: "negative", synonyms: "restrictive" },
  ];

  const courtOptions = [
    { label: "Putrajaya Federal Court", value: "Putrajaya Federal Court" },
    { label: "Putrajaya Court of Appeal", value: "Putrajaya Court of Appeal" },
    { label: "Kangar High Court", value: "Kangar High Court" },
    { label: "Alor Setar High Court", value: "Alor Setar High Court" },
    { label: "Sungai Petani High Court", value: "Sungai Petani High Court" },
    { label: "George Town High Court", value: "George Town High Court" },
    { label: "Ipoh High Court", value: "Ipoh High Court" },
    { label: "Taiping High Court", value: "Taiping High Court" },
    { label: "Shah Alam High Court", value: "Shah Alam High Court" },
    { label: "Klang HighJan Court", value: "Klang High Court" },
    { label: "Kuala Lumpur High Court", value: "Kuala Lumpur High Court" },
    { label: "Seremban High Court", value: "Seremban High Court" },
    { label: "Melaka High Court", value: "Melaka High Court" },
    { label: "Johor Bahru High Court", value: "Johor Bahru High Court" },
    { label: "Muar High Court", value: "Muar High Court" },
    { label: "Kuantan High Court", value: "Kuantan High Court" },
    { label: "Temerloh High Court", value: "Temerloh High Court" },
    {
      label: "Kuala Terengganu High Court",
      value: "Kuala Terengganu High Court",
    },
    { label: "Kota Bharu High Court", value: "Kota Bharu High Court" },
    { label: "Kota Kinabalu High Court", value: "Kota Kinabalu High Court" },
    { label: "Sandakan High Court", value: "Sandakan High Court" },
    { label: "Tawau High Court", value: "Tawau High Court" },
    { label: "Kuching High Court", value: "Kuching High Court" },
    { label: "Sibu High Court", value: "Sibu High Court" },
    { label: "Miri High Court", value: "Miri High Court" },
    { label: "Bintulu High Court", value: "Bintulu High Court" },
    { label: "Sri Aman High Court", value: "Sri Aman High Court" },
    { label: "Limbang High Court", value: "Limbang High Court" },
    { label: "Kangar Sessions Court", value: "Kangar Sessions Court" },
    { label: "Alor Setar Sessions Court", value: "Alor Setar Sessions Court" },
    {
      label: "Sungai Petani Sessions Court",
      value: "Sungai Petani Sessions Court",
    },
    {
      label: "George Town Sessions Court",
      value: "George Town Sessions Court",
    },
    {
      label: "Butterworth Sessions Court",
      value: "Butterworth Sessions Court",
    },
    { label: "Ipoh Sessions Court", value: "Ipoh Sessions Court" },
    { label: "Taiping Sessions Court", value: "Taiping Sessions Court" },
    {
      label: "Teluk Intan Sessions Court",
      value: "Teluk Intan Sessions Court",
    },
    { label: "Shah Alam Sessions Court", value: "Shah Alam Sessions Court" },
    {
      label: "Petaling Jaya Sessions Court",
      value: "Petaling Jaya Sessions Court",
    },
    { label: "Klang Sessions Court", value: "Klang Sessions Court" },
    { label: "Sepang Sessions Court", value: "Sepang Sessions Court" },
    {
      label: "Kuala Lumpur Sessions Court",
      value: "Kuala Lumpur Sessions Court",
    },
    { label: "Putrajaya Sessions Court", value: "Putrajaya Sessions Court" },
    { label: "Seremban Sessions Court", value: "Seremban Sessions Court" },
    {
      label: "Kuala Pilah Sessions Court",
      value: "Kuala Pilah Sessions Court",
    },
    { label: "Melaka Sessions Court", value: "Melaka Sessions Court" },
    {
      label: "Johor Bahru Sessions Court",
      value: "Johor Bahru Sessions Court",
    },
    { label: "Muar Sessions Court", value: "Muar Sessions Court" },
    { label: "Kluang Sessions Court", value: "Kluang Sessions Court" },
    { label: "Kuantan Sessions Court", value: "Kuantan Sessions Court" },
    { label: "Temerloh Sessions Court", value: "Temerloh Sessions Court" },
    { label: "Raub Sessions Court", value: "Raub Sessions Court" },
    {
      label: "Kuala Terengganu Sessions Court",
      value: "Kuala Terengganu Sessions Court",
    },
    { label: "Kemaman Sessions Court", value: "Kemaman Sessions Court" },
    { label: "Kota Bharu Sessions Court", value: "Kota Bharu Sessions Court" },
    { label: "Gua Musang Sessions Court", value: "Gua Musang Sessions Court" },
    {
      label: "Kota Kinabalu Sessions Court",
      value: "Kota Kinabalu Sessions Court",
    },
    { label: "Sandakan Sessions Court", value: "Sandakan Sessions Court" },
    { label: "Tawau Sessions Court", value: "Tawau Sessions Court" },
    { label: "Kuching Sessions Court", value: "Kuching Sessions Court" },
    { label: "Sibu Sessions Court", value: "Sibu Sessions Court" },
    { label: "Miri Sessions Court", value: "Miri Sessions Court" },
    { label: "Bintulu Sessions Court", value: "Bintulu Sessions Court" },
    { label: "Kangar Magistrate Court", value: "Kangar Magistrate Court" },
    {
      label: "Alor Setar Magistrate Court",
      value: "Alor Setar Magistrate Court",
    },
    {
      label: "Sungai Petani Magistrate Court",
      value: "Sungai Petani Magistrate Court",
    },
    {
      label: "George Town Magistrate Court",
      value: "George Town Magistrate Court",
    },
    {
      label: "Butterworth Magistrate Court",
      value: "Butterworth Magistrate Court",
    },
    { label: "Ipoh Magistrate Court", value: "Ipoh Magistrate Court" },
    { label: "Taiping Magistrate Court", value: "Taiping Magistrate Court" },
    {
      label: "Teluk Intan Magistrate Court",
      value: "Teluk Intan Magistrate Court",
    },
    {
      label: "Shah Alam Magistrate Court",
      value: "Shah Alam Magistrate Court",
    },
    {
      label: "Petaling Jaya Magistrate Court",
      value: "Petaling Jaya Magistrate Court",
    },
    { label: "Klang Magistrate Court", value: "Klang Magistrate Court" },
    { label: "Sepang Magistrate Court", value: "Sepang Magistrate Court" },
    {
      label: "Kuala Lumpur Magistrate Court",
      value: "Kuala Lumpur Magistrate Court",
    },
    {
      label: "Putrajaya Magistrate Court",
      value: "Putrajaya Magistrate Court",
    },
    { label: "Seremban Magistrate Court", value: "Seremban Magistrate Court" },
    {
      label: "Kuala Pilah Magistrate Court",
      value: "Kuala Pilah Magistrate Court",
    },
    { label: "Melaka Magistrate Court", value: "Melaka Magistrate Court" },
    {
      label: "Alor Gajah Magistrate Court",
      value: "Alor Gajah Magistrate Court",
    },
    { label: "Jasin Magistrate Court", value: "Jasin Magistrate Court" },
    {
      label: "Johor Bahru Magistrate Court",
      value: "Johor Bahru Magistrate Court",
    },
    { label: "Muar Magistrate Court", value: "Muar Magistrate Court" },
    { label: "Kluang Magistrate Court", value: "Kluang Magistrate Court" },
    { label: "Kuantan Magistrate Court", value: "Kuantan Magistrate Court" },
    { label: "Temerloh Magistrate Court", value: "Temerloh Magistrate Court" },
    { label: "Raub Magistrate Court", value: "Raub Magistrate Court" },
    {
      label: "Kuala Terengganu Magistrate Court",
      value: "Kuala Terengganu Magistrate Court",
    },
    { label: "Kemaman Magistrate Court", value: "Kemaman Magistrate Court" },
    {
      label: "Kota Bharu Magistrate Court",
      value: "Kota Bharu Magistrate Court",
    },
    {
      label: "Gua Musang Magistrate Court",
      value: "Gua Musang Magistrate Court",
    },
    {
      label: "Kota Kinabalu Magistrate Court",
      value: "Kota Kinabalu Magistrate Court",
    },
    { label: "Sandakan Magistrate Court", value: "Sandakan Magistrate Court" },
    { label: "Tawau Magistrate Court", value: "Tawau Magistrate Court" },
    { label: "Kuching Magistrate Court", value: "Kuching Magistrate Court" },
    { label: "Sibu Magistrate Court", value: "Sibu Magistrate Court" },
    { label: "Miri Magistrate Court", value: "Miri Magistrate Court" },
    { label: "Bintulu Magistrate Court", value: "Bintulu Magistrate Court" },
  ];

  const initialFieldsConfig = {
    mandatory: [
      {
        id: uuidv4(),
        key: "typeOfClaims",
        label: "Type of Claims",
        type: "dropdown",
        mandatory: true,
        options: [
          { label: "Accident Claims", value: "accident" },
          { label: "Medical Claims", value: "medical" },
          { label: "Corporate Claims", value: "corporate" },
        ],
      },
      {
        id: uuidv4(),
        key: "insuranceRef",
        label: "Insurance Reference",
        type: "text",
        mandatory: true,
      },
      {
        id: uuidv4(),
        key: "vinsPartnershipReference",
        label: "Vin Partnership Reference",
        type: "text",
        mandatory: true,
      },
      {
        id: uuidv4(),
        key: "summonsNo",
        label: "Summons No.",
        type: "text",
        mandatory: true,
      },
    ],
    customLabels: [
      {
        id: uuidv4(),
        label: "Court",
        fields: [
          {
            id: uuidv4(),
            key: "court",
            type: "dropdown",
            options: courtOptions,
            filter: true,
          },
        ],
      },
      {
        id: uuidv4(),
        label: "Plaintiff's Solicitors",
        fields: [{ id: uuidv4(), key: "plaintiffSolicitors", type: "text" }],
      },
      {
        id: uuidv4(),
        label: "Plaintiff",
        fields: [{ id: uuidv4(), key: "plaintiff", type: "text" }],
      },
      {
        id: uuidv4(),
        label: "Insured Driver",
        fields: [{ id: uuidv4(), key: "insuredDriver", type: "text" }],
      },
      {
        id: uuidv4(),
        label: "Insured",
        fields: [{ id: uuidv4(), key: "insured", type: "text" }],
      },
      {
        id: uuidv4(),
        label: "Insured Vehicle",
        fields: [{ id: uuidv4(), key: "insuredVehicle", type: "text" }],
      },
      {
        id: uuidv4(),
        label: "Date and Time of Collision",
        fields: [
          { id: uuidv4(), key: "collisionDateTime", type: "datetime-local" },
        ],
      },
      {
        id: uuidv4(),
        label: "Claim Status",
        fields: [
          {
            id: uuidv4(),
            key: "claimStatus",
            type: "dropdown",
            options: [
              { label: "FILED", value: "FILED" },
              { label: "TRIAL", value: "TRIAL" },
              { label: "UNDER REVIEW", value: "UNDER REVIEW" },
              { label: "PENDING DOCUMENTS", value: "PENDING DOCUMENTS" },
              {
                label: "SETTLEMENT IN PROGRESS",
                value: "SETTLEMENT IN PROGRESS",
              },
              { label: "APPROVED", value: "APPROVED" },
              { label: "PAID & CLOSED", value: "PAID & CLOSED" },
              { label: "DENIED", value: "DENIED" },
              { label: "APPEAL FILED", value: "APPEAL FILED" },
              {
                label: "IN THE COURT (LITIGATION)",
                value: "IN THE COURT (LITIGATION)",
              },
              { label: "JUDGMENT ISSUED", value: "JUDGMENT ISSUED" },
            ],
          },
          {
            id: uuidv4(),
            key: "claimStatusDate",
            type: "date",
          },
        ],
      },
    ],
    additionalInfo: [
      {
        id: uuidv4(),
        label: "Partners",
        keyPrefix: "partner",
        fields: [
          {
            id: uuidv4(),
            key: `partner_${uuidv4().substring(0, 8)}`,
            type: "text",
          },
        ],
        allowMultiple: true,
      },
      {
        id: uuidv4(),
        label: "Legal Assistants",
        keyPrefix: "legal_assistant",
        fields: [
          {
            id: uuidv4(),
            key: `legal_assistant_${uuidv4().substring(0, 8)}`,
            type: "text",
          },
        ],
        allowMultiple: true,
      },
      {
        id: uuidv4(),
        label: "Insurance Company",
        key: "insuranceCompany",
        type: "text",
        allowMultiple: false,
      },
      {
        id: uuidv4(),
        label: "Date",
        key: "additionalInfoDate",
        type: "date",
        allowMultiple: false,
      },
      {
        id: uuidv4(),
        label: "Recipient",
        key: "additionalRecipient",
        type: "text",
        allowMultiple: false,
      },
    ],
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [_entity, set_entity] = useState({
    typeOfClaims: "",
    insuranceRef: "",
    vinsPartnershipReference: "",
    summonsNo: "",
    caseDetails: initialFieldsConfig.customLabels.map((label) => ({
      label: label.label,
      fields: label.fields.map((field) => ({
        key: field.key,
        value: "",
        type: field.type,
      })),
    })),
    additionalInfo: {
      partners: [
        { id: uuidv4(), key: `partner_${uuidv4().substring(0, 8)}`, value: "" },
      ],
      legalAssistants: [
        {
          id: uuidv4(),
          key: `legal_assistant_${uuidv4().substring(0, 8)}`,
          value: "",
        },
      ],
      insuranceCompany: "",
      additionalInfoDate: "",
      additionalRecipient: "",
    },
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const [createdCaseId, setCreatedCaseId] = useState(null);
  const [categorizedFiles, setCategorizedFiles] = useState({
    plaintiff: [],
    adjuster: [],
    medical: [],
  });
  const [uploading, setUploading] = useState({
    plaintiff: false,
    adjuster: false,
    medical: false,
  });

  const [fieldsConfig, setFieldsConfig] = useState(initialFieldsConfig);
  const [newLabelName, setNewLabelName] = useState("");

  const stepItems = [
    { label: "Case Details", command: () => setError({}) },
    { label: "Upload Documents", command: () => setError({}) },
    { label: "Additional Info", command: () => setError({}) },
    { label: "Review and Submit", command: () => setError({}) },
  ];

  const sensors = useSensors(useSensor(PointerSensor));

  const setValByKey = (key, val, section = "caseDetails") => {
    set_entity((prev) => {
      if (fieldsConfig.mandatory.find((f) => f.key === key)) {
        return { ...prev, [key]: val };
      }
      if (section === "additionalInfo") {
        const isMultiple = fieldsConfig.additionalInfo.find(
          (f) => f.keyPrefix === key,
        );
        if (isMultiple) {
          const currentFields = Array.isArray(prev.additionalInfo[key])
            ? prev.additionalInfo[key]
            : [];
          const updatedFields = currentFields.some(
            (field) => field.key === val.key,
          )
            ? currentFields.map((field) =>
                field.key === val.key ? { ...field, value: val.value } : field,
              )
            : [
                ...currentFields,
                { id: uuidv4(), key: val.key, value: val.value },
              ];
          return {
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              [key]: updatedFields,
            },
          };
        }
        return {
          ...prev,
          additionalInfo: {
            ...prev.additionalInfo,
            [key]: val,
          },
        };
      }
      const existingField = prev.caseDetails
        .flatMap((label) => label.fields)
        .find((f) => f.key === key);
      let updatedCaseDetails = prev.caseDetails.map((label) => ({
        ...label,
        fields: label.fields.map((f) =>
          f.key === key ? { ...f, value: val } : f,
        ),
      }));
      if (!existingField) {
        const labelConfig = fieldsConfig.customLabels.find((l) =>
          l.fields.some((f) => f.key === key),
        );
        if (labelConfig) {
          const targetLabel = updatedCaseDetails.find(
            (l) => l.label === labelConfig.label,
          );
          if (targetLabel) {
            targetLabel.fields.push({
              key,
              value: val,
              type: labelConfig.fields.find((f) => f.key === key).type,
            });
          } else {
            updatedCaseDetails = [
              ...updatedCaseDetails,
              {
                label: labelConfig.label,
                fields: [
                  {
                    key,
                    value: val,
                    type: labelConfig.fields.find((f) => f.key === key).type,
                  },
                ],
              },
            ];
          }
        }
      }
      return { ...prev, caseDetails: updatedCaseDetails };
    });
    setError((prev) => _.omit(prev, key));
  };

  const validateDateFormat = (value, fieldKey) => {
    if (!value) return null;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value)) {
      return "Invalid format. Use yyyy-mm-dd (e.g., 2025-07-04)";
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return null;
  };

  const validateDateTimeFormat = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "Invalid date or time";
    }
    return null;
  };

  const handleDateTimeInput = (e) => {
    const inputValue = e.value;
    setValByKey("collisionDateTime", inputValue);
    const errorMsg = validateDateTimeFormat(inputValue);
    setError((prev) => ({
      ...prev,
      collisionDateTime: errorMsg || undefined,
    }));
  };

  const handleDateInput = (e, fieldKey) => {
    const inputValue = e.value;
    setValByKey(fieldKey, inputValue);
    const errorMsg = validateDateFormat(inputValue, fieldKey);
    setError((prev) => ({
      ...prev,
      [fieldKey]: errorMsg || undefined,
    }));
  };

  const handleAdditionalDateInput = (e) => {
    const inputValue = e.value;
    setValByKey("additionalInfoDate", inputValue, "additionalInfo");
    const errorMsg = validateDateFormat(inputValue, "additionalInfoDate");
    setError((prev) => ({
      ...prev,
      additionalInfoDate: errorMsg || undefined,
    }));
  };

  const validateStep0 = () => {
    let isValid = true;
    const errors = {};
    const requiredFields = [
      "typeOfClaims",
      "insuranceRef",
      "vinsPartnershipReference",
      "summonsNo",
    ];

    requiredFields.forEach((field) => {
      if (_.isEmpty(_entity[field]?.toString())) {
        errors[field] =
          `${fieldsConfig.mandatory.find((f) => f.key === field)?.label || field} is required`;
        isValid = false;
      }
    });

    fieldsConfig.customLabels.forEach((label) => {
      label.fields.forEach((field) => {
        const fieldValue = _entity.caseDetails
          .find((l) => l.label === label.label)
          ?.fields.find((f) => f.key === field.key)?.value;
        if (field.type === "datetime-local") {
          if (fieldValue) {
            const errorMsg = validateDateTimeFormat(fieldValue);
            if (errorMsg) {
              errors[field.key] = errorMsg;
              isValid = false;
            }
          }
        } else if (field.type === "date") {
          if (fieldValue) {
            const errorMsg = validateDateFormat(fieldValue, field.key);
            if (errorMsg) {
              errors[field.key] = errorMsg;
              isValid = false;
            }
          }
        }
      });
    });

    setError(errors);
    return isValid;
  };

  const validateStep1 = () => {
    const totalFiles =
      categorizedFiles.plaintiff.length +
      categorizedFiles.adjuster.length +
      categorizedFiles.medical.length;
    if (totalFiles === 0) {
      setError({
        upload: "At least one document must be uploaded to proceed.",
      });
      return false;
    }
    if (categorizedFiles.plaintiff.length > 2) {
      setError({ upload: "Maximum of 2 plaintiff files allowed." });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    let isValid = true;
    const errors = {};
    if (_entity.additionalInfo.additionalInfoDate) {
      const errorMsg = validateDateFormat(
        _entity.additionalInfo.additionalInfoDate,
        "additionalInfoDate",
      );
      if (errorMsg) {
        errors.additionalInfoDate = errorMsg;
        isValid = false;
      }
    }
    setError(errors);
    return isValid;
  };

  const addNewLabel = () => {
    if (!newLabelName) {
      toast.current?.show({
        severity: "warn",
        summary: "Invalid Input",
        detail: "Please enter a label name.",
        life: 3000,
      });
      return;
    }
    const key =
      newLabelName.toLowerCase().replace(/\s+/g, "_") +
      "_" +
      uuidv4().substring(0, 8);
    const newLabel = {
      id: uuidv4(),
      label: newLabelName,
      fields: [{ id: uuidv4(), key, type: "text" }],
    };
    setFieldsConfig((prev) => ({
      ...prev,
      customLabels: [...prev.customLabels, newLabel],
    }));
    set_entity((prev) => ({
      ...prev,
      caseDetails: [
        ...prev.caseDetails,
        { label: newLabelName, fields: [{ key, value: "", type: "text" }] },
      ],
    }));
    setNewLabelName("");
    toast.current?.show({
      severity: "success",
      summary: "Label Added",
      detail: `Label "${newLabelName}" added successfully.`,
      life: 3000,
    });
  };

  const addFieldToLabel = (labelId) => {
    const label = fieldsConfig.customLabels.find((l) => l.id === labelId);
    const key = `field_${uuidv4().substring(0, 8)}`;
    const newField = { id: uuidv4(), key, type: "text" };
    setFieldsConfig((prev) => ({
      ...prev,
      customLabels: prev.customLabels.map((l) =>
        l.id === labelId ? { ...l, fields: [...l.fields, newField] } : l,
      ),
    }));
    set_entity((prev) => ({
      ...prev,
      caseDetails: prev.caseDetails.map((l) =>
        l.label === label.label
          ? {
              ...l,
              fields: [...l.fields, { key, value: "", type: newField.type }],
            }
          : l,
      ),
    }));
  };

  const removeFieldFromLabel = (labelId, fieldId) => {
    const label = fieldsConfig.customLabels.find((l) => l.id === labelId);
    if (label.fields.length <= 1) {
      toast.current?.show({
        severity: "warn",
        summary: "Cannot Remove Field",
        detail: `Cannot delete the last field in "${label.label}". Please delete the entire label instead.`,
        life: 3000,
      });
      return;
    }

    const field = label.fields.find((f) => f.id === fieldId);
    setFieldsConfig((prev) => ({
      ...prev,
      customLabels: prev.customLabels.map((l) =>
        l.id === labelId
          ? { ...l, fields: l.fields.filter((f) => f.id !== fieldId) }
          : l,
      ),
    }));
    set_entity((prev) => ({
      ...prev,
      caseDetails: prev.caseDetails.map((l) =>
        l.label === label.label
          ? { ...l, fields: l.fields.filter((f) => f.key !== field.key) }
          : l,
      ),
    }));
    setError((prev) => _.omit(prev, field.key));
    toast.current?.show({
      severity: "info",
      summary: "Field Removed",
      detail: `Field in "${label.label}" removed.`,
      life: 3000,
    });
  };

  const removeFieldFromAdditionalInfo = (label, fieldId) => {
    const keyPrefix = label === "Partners" ? "partner" : "legal_assistant";
    const fieldConfig = fieldsConfig.additionalInfo.find(
      (f) => f.label === label,
    );

    if (fieldConfig.fields.length <= 1) {
      toast.current?.show({
        severity: "warn",
        summary: "Cannot Remove Field",
        detail: `Cannot delete the last field in "${label}". At least one field is required.`,
        life: 3000,
      });
      return;
    }

    setFieldsConfig((prev) => ({
      ...prev,
      additionalInfo: prev.additionalInfo.map((item) =>
        item.label === label
          ? { ...item, fields: item.fields.filter((f) => f.id !== fieldId) }
          : item,
      ),
    }));
    set_entity((prev) => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [keyPrefix]: prev.additionalInfo[keyPrefix].filter(
          (f) => f.id !== fieldId,
        ),
      },
    }));
    toast.current?.show({
      severity: "info",
      summary: "Field Removed",
      detail: `Field in "${label}" removed.`,
      life: 3000,
    });
  };

  const addFieldToAdditionalInfo = (label) => {
    const keyPrefix = label === "Partners" ? "partner" : "legal_assistant";
    const key = `${keyPrefix}_${uuidv4().substring(0, 8)}`;
    setFieldsConfig((prev) => ({
      ...prev,
      additionalInfo: prev.additionalInfo.map((item) =>
        item.label === label
          ? {
              ...item,
              fields: [...item.fields, { id: uuidv4(), key, type: "text" }],
            }
          : item,
      ),
    }));
    set_entity((prev) => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [keyPrefix]: [
          ...(Array.isArray(prev.additionalInfo[keyPrefix])
            ? prev.additionalInfo[keyPrefix]
            : []),
          { id: uuidv4(), key, value: "" },
        ],
      },
    }));
  };

  const removeLabel = (labelId) => {
    const label = fieldsConfig.customLabels.find((l) => l.id === labelId);
    setFieldsConfig((prev) => ({
      ...prev,
      customLabels: prev.customLabels.filter((l) => l.id !== labelId),
    }));
    set_entity((prev) => ({
      ...prev,
      caseDetails: prev.caseDetails.filter((l) => l.label !== label.label),
    }));
    setError((prev) =>
      _.omit(
        prev,
        label.fields.map((f) => f.key),
      ),
    );
    toast.current?.show({
      severity: "info",
      summary: "Label Removed",
      detail: `Label "${label.label}" removed.`,
      life: 3000,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFieldsConfig((prev) => {
        const oldIndex = prev.customLabels.findIndex((l) => l.id === active.id);
        const newIndex = prev.customLabels.findIndex((l) => l.id === over.id);
        const newCustomLabels = [...prev.customLabels];
        const [movedLabel] = newCustomLabels.splice(oldIndex, 1);
        newCustomLabels.splice(newIndex, 0, movedLabel);
        return { ...prev, customLabels: newCustomLabels };
      });
    }
  };

  const SortableLabel = ({ label }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: label.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      width: "100%",
      boxSizing: "border-box",
    };

    const isSingleField = label.fields.length === 1;
    const isFixedLabel = [
      "Date and Time of Collision",
      "Claim Status",
    ].includes(label.label);
    const isCourtLabel = label.label === "Court";

    return (
      <div ref={setNodeRef} style={style} className="draggable-label p-mb-3">
        <div className="p-d-flex p-ai-center p-jc-between p-mb-2 label-header">
          <div className="p-d-flex p-ai-center">
            <i
              className="pi pi-bars p-mr-2 drag-handle"
              {...attributes}
              {...listeners}
            ></i>
            <h6 className="label-title ml-3">{label.label}</h6>
          </div>
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-text icon-sm"
            onClick={() => removeLabel(label.id)}
            tooltip="Remove Label"
          />
        </div>
        <div className="p-grid p-formgrid custom-fields-grid">
          {label.fields.map((field) => (
            <div
              key={field.id}
              className="p-field p-col-12 p-md-6 custom-field"
            >
              <div className="field-container">
                {field.type === "dropdown" ? (
                  <Dropdown
                    id={field.id}
                    value={
                      _entity.caseDetails
                        .find((l) => l.label === label.label)
                        ?.fields.find((f) => f.key === field.key)?.value || ""
                    }
                    options={field.options}
                    onChange={(e) => setValByKey(field.key, e.value)}
                    placeholder={`Select ${label.label}${field.key === "claimStatus" ? " Status" : ""}`}
                    className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
                    filter={field.filter}
                  />
                ) : field.type === "datetime-local" ? (
                  <Calendar
                    id={field.id}
                    value={
                      _entity.caseDetails
                        .find((l) => l.label === label.label)
                        ?.fields.find((f) => f.key === field.key)?.value
                        ? new Date(
                            _entity.caseDetails
                              .find((l) => l.label === label.label)
                              ?.fields.find((f) => f.key === field.key)?.value,
                          )
                        : null
                    }
                    onChange={(e) => handleDateTimeInput(e)}
                    showTime
                    hourFormat="24"
                    className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
                    placeholder="Select date and time"
                  />
                ) : field.type === "date" ? (
                  <Calendar
                    id={field.id}
                    value={
                      _entity.caseDetails
                        .find((l) => l.label === label.label)
                        ?.fields.find((f) => f.key === field.key)?.value
                        ? new Date(
                            _entity.caseDetails
                              .find((l) => l.label === label.label)
                              ?.fields.find((f) => f.key === field.key)?.value,
                          )
                        : null
                    }
                    onChange={(e) => handleDateInput(e, field.key)}
                    dateFormat="yy-mm-dd"
                    className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
                    placeholder="yyyy-mm-dd (e.g., 2025-07-04)"
                  />
                ) : (
                  <InputText
                    id={field.id}
                    value={
                      _entity.caseDetails
                        .find((l) => l.label === label.label)
                        ?.fields.find((f) => f.key === field.key)?.value || ""
                    }
                    onChange={(e) => setValByKey(field.key, e.target.value)}
                    className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
                    placeholder={`Enter ${label.label}`}
                  />
                )}
                {!isFixedLabel && !isCourtLabel && (
                  <Button
                    icon="pi pi-plus"
                    className="p-button-rounded p-button-success p-button-text p-ml-2 icon-sm"
                    onClick={() => addFieldToLabel(label.id)}
                    tooltip="Add Field"
                  />
                )}
                {!isFixedLabel && !isCourtLabel && !isSingleField && (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text p-ml-2 icon-sm"
                    onClick={() => removeFieldFromLabel(label.id, field.id)}
                    tooltip="Remove Field"
                  />
                )}
                {error[field.key] && (
                  <small className="p-error">{error[field.key]}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdditionalInfoField = (fieldConfig) => {
    return (
      <div
        key={fieldConfig.id}
        className="p-field p-col-12 p-md-6 additional-info-field"
      >
        <label
          className="p-field-label"
          htmlFor={fieldConfig.key || fieldConfig.keyPrefix}
        >
          {fieldConfig.label}
        </label>
        {fieldConfig.allowMultiple ? (
          fieldConfig.fields.map((field) => (
            <div key={field.id} className="field-container p-mt-2">
              <InputText
                id={field.id}
                value={
                  _entity.additionalInfo[fieldConfig.keyPrefix]?.find(
                    (f) => f.key === field.key,
                  )?.value || ""
                }
                onChange={(e) =>
                  setValByKey(
                    fieldConfig.keyPrefix,
                    { key: field.key, value: e.target.value },
                    "additionalInfo",
                  )
                }
                className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
                placeholder={`Enter ${fieldConfig.label}`}
              />
              <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-success p-button-text p-ml-2 icon-sm"
                onClick={() => addFieldToAdditionalInfo(fieldConfig.label)}
                tooltip={`Add ${fieldConfig.label} Field`}
              />
              {fieldConfig.fields.length > 1 && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger p-button-text p-ml-2 icon-sm"
                  onClick={() =>
                    removeFieldFromAdditionalInfo(fieldConfig.label, field.id)
                  }
                  tooltip={`Remove ${fieldConfig.label} Field`}
                />
              )}
              {error[field.key] && (
                <small className="p-error">{error[field.key]}</small>
              )}
            </div>
          ))
        ) : fieldConfig.type === "date" ? (
          <Calendar
            id={fieldConfig.key}
            value={
              _entity.additionalInfo[fieldConfig.key]
                ? new Date(_entity.additionalInfo[fieldConfig.key])
                : null
            }
            onChange={handleAdditionalDateInput}
            dateFormat="yy-mm-dd"
            className={`input-themed w-full ${error[fieldConfig.key] ? "p-invalid" : ""}`}
            placeholder="yyyy-mm-dd (e.g., 2025-07-04)"
          />
        ) : (
          <InputText
            id={fieldConfig.key}
            value={_entity.additionalInfo[fieldConfig.key] || ""}
            onChange={(e) =>
              setValByKey(fieldConfig.key, e.target.value, "additionalInfo")
            }
            className={`input-themed w-full ${error[fieldConfig.key] ? "p-invalid" : ""}`}
            placeholder={`Enter ${fieldConfig.label}`}
          />
        )}
        {error[fieldConfig.key] && !fieldConfig.allowMultiple && (
          <small className="p-error">{error[fieldConfig.key]}</small>
        )}
      </div>
    );
  };

  const handleUploadAndSave = async (documentStorageIds, category) => {
    if (!documentStorageIds || documentStorageIds.length === 0) return;

    if (category === "plaintiff") {
      const currentPlaintiffCount = categorizedFiles.plaintiff.length;
      const newFilesCount = documentStorageIds.length;
      if (currentPlaintiffCount + newFilesCount > 2) {
        toast.current?.show({
          severity: "error",
          summary: "Upload Limit Exceeded",
          detail: `Cannot upload more than 2 plaintiff files. Currently have ${currentPlaintiffCount} file(s).`,
          life: 4000,
        });
        return;
      }
    }

    setUploading((prev) => ({ ...prev, [category]: true }));

    let successCount = 0;
    const addedFilesInfo = [];
    const errorMessages = [];

    for (const docStorageId of documentStorageIds) {
      try {
        const docStorageResult = await client
          .service("documentStorages")
          .get(docStorageId);
        addedFilesInfo.push({
          documentStorageId: docStorageId,
          caseDocumentId: null, // Case document ID will be set after case creation
          name:
            docStorageResult.originalFileName ||
            `Document ${docStorageId.substring(0, 6)}`,
        });
        successCount++;
      } catch (err) {
        const errorDetail =
          err.message ||
          `Failed to retrieve document ${docStorageId.substring(0, 6)}`;
        console.error(
          `Error retrieving document (ID: ${docStorageId}) for category ${category}:`,
          err,
        );
        errorMessages.push(errorDetail);
        try {
          await client.service("documentStorages").remove(docStorageId);
          console.log(`Removed orphaned documentStorage ${docStorageId}`);
        } catch (removeErr) {
          console.error(
            `Error removing orphaned documentStorage ${docStorageId}:`,
            removeErr,
          );
        }
      }
    }

    if (addedFilesInfo.length > 0) {
      setCategorizedFiles((prev) => ({
        ...prev,
        [category]: [...prev[category], ...addedFilesInfo],
      }));
    }

    if (successCount > 0) {
      toast.current?.show({
        severity: "success",
        summary: "Upload Complete",
        detail: `${successCount} file(s) uploaded successfully for ${category}.`,
        life: 3000,
      });
    }
    if (errorMessages.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Document Upload Error",
        detail: `${errorMessages.length} file(s) failed to upload: ${errorMessages.join(", ")}`,
        life: 5000,
      });
    }

    setUploading((prev) => ({ ...prev, [category]: false }));
  };

  const handleRemoveFile = async (fileInfoToRemove, category) => {
    if (!fileInfoToRemove?.documentStorageId) {
      toast.current?.show({
        severity: "warn",
        summary: "Cannot Remove",
        detail: "File information is missing.",
        life: 3000,
      });
      return;
    }

    setUploading((prev) => ({ ...prev, [category]: true }));

    try {
      await client
        .service("documentStorages")
        .remove(fileInfoToRemove.documentStorageId);

      setCategorizedFiles((prev) => ({
        ...prev,
        [category]: prev[category].filter(
          (f) => f.documentStorageId !== fileInfoToRemove.documentStorageId,
        ),
      }));

      toast.current?.show({
        severity: "info",
        summary: "File Removed",
        detail: `File ${fileInfoToRemove.name} removed.`,
        life: 3000,
      });
    } catch (err) {
      console.error(
        `Error removing file (DocStorageID: ${fileInfoToRemove.documentStorageId}):`,
        err,
      );
      toast.current?.show({
        severity: "error",
        summary: "Removal Failed",
        detail: `Could not remove file ${fileInfoToRemove.name}. ${err.message || ""}`,
        life: 4000,
      });
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
    }
  };

  const handleNext = async () => {
    setError({});

    if (currentStep === 0) {
      if (!validateStep0()) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError({});
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (currentStep !== 3) return;
    setLoading(true);

    try {
      const caseData = {
        typeOfClaims: _entity.typeOfClaims,
        insuranceRef: _entity.insuranceRef,
        vinsPartnershipReference: _entity.vinsPartnershipReference,
        summonsNo: _entity.summonsNo,
        caseDetails: _entity.caseDetails,
        partners: _entity.additionalInfo.partners
          .map((p) => p.value)
          .filter((v) => v),
        legalAssistants: _entity.additionalInfo.legalAssistants
          .map((la) => la.value)
          .filter((v) => v),
        insuranceCompany: _entity.additionalInfo.insuranceCompany,
        additionalInfoDate: _entity.additionalInfo.additionalInfoDate
          ? new Date(_entity.additionalInfo.additionalInfoDate)
          : null,
        additionalRecipient: _entity.additionalInfo.additionalRecipient,
        synonyms: synonymousList.map((item) => ({
          primary: item.primary,
          synonymsList: item.synonyms.split(", ").map((syn) => syn.trim()),
        })),
        createdBy: props.user._id,
        updatedBy: props.user._id,
      };

      const caseResult = await client.service("accidentCases").create(caseData);
      setCreatedCaseId(caseResult._id);

      // Create caseDocuments for uploaded files
      const categories = [
        { files: categorizedFiles.plaintiff, docType: "Plaintiff File" },
        { files: categorizedFiles.adjuster, docType: "Adjuster Report" },
        { files: categorizedFiles.medical, docType: "Medical File" },
      ];

      let docSuccessCount = 0;
      const docErrorMessages = [];

      for (const { files, docType } of categories) {
        for (const fileInfo of files) {
          const caseDocData = {
            summonsNo: caseResult._id,
            uploadedDocument: [fileInfo.documentStorageId],
            documentType: docType,
            uploadTimestamp: new Date(),
            createdBy: props.user._id,
            updatedBy: props.user._id,
          };

          try {
            const caseDocResult = await client
              .service("caseDocuments")
              .create(caseDocData);
            await client
              .service("documentStorages")
              .patch(fileInfo.documentStorageId, {
                tableId: caseDocResult._id,
                tableName: "caseDocuments",
              });

            setCategorizedFiles((prev) => ({
              ...prev,
              [docType.toLowerCase().split(" ")[0]]: prev[
                docType.toLowerCase().split(" ")[0]
              ].map((f) =>
                f.documentStorageId === fileInfo.documentStorageId
                  ? { ...f, caseDocumentId: caseDocResult._id }
                  : f,
              ),
            }));

            docSuccessCount++;
          } catch (err) {
            console.error(
              `Error creating caseDocument for ${fileInfo.name}:`,
              err,
            );
            docErrorMessages.push(
              `Failed to save ${docType}: ${fileInfo.name}`,
            );
          }
        }
      }

      if (docSuccessCount > 0) {
        toast.current?.show({
          severity: "success",
          summary: "Documents Linked",
          detail: `${docSuccessCount} document(s) successfully linked to the case.`,
          life: 3000,
        });
      }
      if (docErrorMessages.length > 0) {
        toast.current?.show({
          severity: "error",
          summary: "Document Linking Error",
          detail: docErrorMessages.join(", "),
          life: 5000,
        });
      }

      await triggerExtractionJobs();

      props.alert({
        type: "success",
        title: "Case Submitted",
        message:
          "Case submitted. Document processing queued for uploaded files.",
      });
      props.onCaseCreated(caseResult);
      setCurrentStep(4);
    } catch (err) {
      console.error("Error creating accident case:", err);
      const validationErrors = getSchemaValidationErrorsStrings(err);
      setError(validationErrors);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: validationErrors.error || "Failed to create case.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerExtractionJobs = async () => {
    const categories = [
      { files: categorizedFiles.plaintiff, docType: "Plaintiff File" },
      { files: categorizedFiles.adjuster, docType: "Adjuster Report" },
      { files: categorizedFiles.medical, docType: "Medical File" },
    ];

    let successCount = 0;
    let skippedCount = 0;
    const errorMessages = [];

    for (const { files, docType } of categories) {
      if (files.length === 0) {
        console.log(`No ${docType} files found to queue for extraction.`);
        continue;
      }

      console.log(
        `Checking extraction jobs for ${files.length} ${docType} files...`,
      );

      const queuePromises = files.map((fileInfo) => {
        if (!fileInfo.caseDocumentId) {
          errorMessages.push(
            `Cannot queue ${docType} file: ${fileInfo.name} (No case document ID)`,
          );
          return Promise.resolve({ error: true, fileInfo });
        }

        return client
          .service("textExtractionQueues")
          .find({
            query: {
              caseDocumentId: fileInfo.caseDocumentId,
              status: { $in: ["queued", "processing"] },
            },
          })
          .then((existing) => {
            if (existing.total > 0) {
              console.log(
                `Extraction job already queued for CaseDoc ${fileInfo.caseDocumentId} (${docType})`,
              );
              skippedCount++;
              return { skipped: true, fileInfo };
            }

            const queueData = {
              caseDocumentId: fileInfo.caseDocumentId,
              documentStorageId: fileInfo.documentStorageId,
              documentType: docType,
              summonsNo: createdCaseId,
              createdBy: props.user._id,
              updatedBy: props.user._id,
            };

            return client
              .service("textExtractionQueues")
              .create(queueData)
              .then((result) => {
                console.log(
                  `Successfully created queue record for CaseDoc ${fileInfo.caseDocumentId} (${docType})`,
                );
                successCount++;
                return { success: true, fileInfo };
              })
              .catch((err) => {
                console.error(
                  `Failed to create queue record for ${fileInfo.name} (CaseDocID: ${fileInfo.caseDocumentId}):`,
                  err,
                );
                errorMessages.push(
                  `Could not queue ${docType} file: ${fileInfo.name}`,
                );
                return { error: err, fileInfo };
              });
          });
      });

      await Promise.allSettled(queuePromises);
    }

    if (successCount > 0) {
      toast.current?.show({
        severity: "success",
        summary: "Extraction Queued",
        detail: `${successCount} file(s) queued for text extraction.`,
        life: 3000,
      });
    }
    if (skippedCount > 0) {
      toast.current?.show({
        severity: "info",
        summary: "Skipped Existing Queues",
        detail: `${skippedCount} file(s) already queued for extraction.`,
        life: 3000,
      });
    }
    if (errorMessages.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Extraction Queueing Failed",
        detail: `${errorMessages.length} file(s) failed to queue: ${errorMessages.join(", ")}`,
        life: 5000,
      });
    }
  };

  const handleHomepage = () => {
    setCurrentStep(0);
    set_entity({
      typeOfClaims: "",
      insuranceRef: "",
      vinsPartnershipReference: "",
      summonsNo: "",
      caseDetails: fieldsConfig.customLabels.map((label) => ({
        label: label.label,
        fields: label.fields.map((field) => ({
          key: field.key,
          value: "",
          type: field.type,
        })),
      })),
      additionalInfo: {
        partners: [
          {
            id: uuidv4(),
            key: `partner_${uuidv4().substring(0, 8)}`,
            value: "",
          },
        ],
        legalAssistants: [
          {
            id: uuidv4(),
            key: `legal_assistant_${uuidv4().substring(0, 8)}`,
            value: "",
          },
        ],
        insuranceCompany: "",
        additionalInfoDate: "",
        additionalRecipient: "",
      },
    });
    setError({});
    setCreatedCaseId(null);
    setCategorizedFiles({ plaintiff: [], adjuster: [], medical: [] });
    setUploading({ plaintiff: false, adjuster: false, medical: false });
    setFieldsConfig((prev) => ({
      ...prev,
      additionalInfo: [
        {
          id: uuidv4(),
          label: "Partners",
          keyPrefix: "partner",
          fields: [
            {
              id: uuidv4(),
              key: `partner_${uuidv4().substring(0, 8)}`,
              type: "text",
            },
          ],
          allowMultiple: true,
        },
        {
          id: uuidv4(),
          label: "Legal Assistants",
          keyPrefix: "legal_assistant",
          fields: [
            {
              id: uuidv4(),
              key: `legal_assistant_${uuidv4().substring(0, 8)}`,
              type: "text",
            },
          ],
          allowMultiple: true,
        },
        {
          id: uuidv4(),
          label: "Insurance Company",
          key: "insuranceCompany",
          type: "text",
          allowMultiple: false,
        },
        {
          id: uuidv4(),
          label: "Date",
          key: "additionalInfoDate",
          type: "date",
          allowMultiple: false,
        },
        {
          id: uuidv4(),
          label: "Recipient",
          key: "additionalRecipient",
          type: "text",
          allowMultiple: false,
        },
      ],
    }));
    props.onHide();
  };

  const renderFileList = (category) => {
    const files = categorizedFiles[category];
    if (!files || files.length === 0) {
      return (
        <p className="p-text-secondary p-mt-2">
          No {category} files uploaded yet.
        </p>
      );
    }
    return (
      <ul
        className="p-list-none p-p-0 p-mt-3"
        style={{ maxHeight: "150px", overflowY: "auto" }}
      >
        {files.map((fileInfo) => (
          <li
            key={fileInfo.documentStorageId}
            className="p-d-flex p-ai-center p-mb-2"
          >
            <i
              className="pi pi-file-pdf p-mr-2"
              style={{ color: "var(--red-500)" }}
            ></i>
            <span className="p-mr-auto">{fileInfo.name}</span>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-danger p-button-text"
              onClick={() => handleRemoveFile(fileInfo, category)}
              tooltip="Remove File"
              disabled={uploading[category]}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderMandatoryField = (field) => {
    const value = _entity[field.key] || "";
    return (
      <div key={field.id} className="p-field p-col-12 p-md-6 mandatory-field">
        <label htmlFor={field.id}>
          {field.label} <span style={{ color: "var(--red-500)" }}>*</span>
        </label>
        {field.type === "dropdown" ? (
          <Dropdown
            id={field.id}
            value={value}
            options={field.options}
            onChange={(e) => setValByKey(field.key, e.value)}
            placeholder={`Select ${field.label}`}
            className={`input-themed w-full ${error[field.key] ? "p-invalid" : ""}`}
          />
        ) : (
          <InputText
            id={field.id}
            value={value}
            onChange={(e) => setValByKey(field.key, e.target.value)}
            className={`input-themed w-full ${error[field.key] ? "p-invalid1342" : ""}`}
            placeholder={`Enter ${field.label}`}
          />
        )}
        {error[field.key] && (
          <small className="p-error">{error[field.key]}</small>
        )}
      </div>
    );
  };

  const renderAddLabelForm = () => (
    <div
      className="p-field p-col-12 p-md-6"
      style={{
        marginTop: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <InputText
        value={newLabelName}
        onChange={(e) => setNewLabelName(e.target.value)}
        placeholder="Enter new label name"
        className="w-full"
      />
      <span
        className="p-text-secondary"
        style={{ cursor: "pointer", whiteSpace: "nowrap" }}
        onClick={() => {
          if (newLabelName) addNewLabel();
          else
            toast.current?.show({
              severity: "warn",
              summary: "Invalid Input",
              detail: "Please enter a label name.",
              life: 3000,
            });
        }}
      >
        +Add input label
      </span>
    </div>
  );

  const renderFooter = () => (
    <div className="dialog-footer">
      <div>
        {currentStep > 0 && currentStep < 4 && (
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            onClick={handleBack}
            className="p-button-secondary p-button-outlined"
            disabled={
              loading ||
              uploading.plaintiff ||
              uploading.adjuster ||
              uploading.medical
            }
          />
        )}
      </div>
      <div>
        {currentStep < 3 && (
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleNext}
            disabled={
              loading ||
              uploading.plaintiff ||
              uploading.adjuster ||
              uploading.medical
            }
            className="themed-button-prime"
          />
        )}
        {currentStep === 3 && (
          <Button
            label="Submit Case"
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={loading}
            disabled={
              uploading.plaintiff || uploading.adjuster || uploading.medical
            }
            className="p-button-success themed-button-success"
          />
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header="Create New Case"
      visible={props.show}
      style={{ width: "70vw", maxWidth: "900px", minWidth: "600px" }}
      modal
      footer={currentStep < 4 ? renderFooter() : null}
      onHide={() => {
        if (currentStep !== 4) props.onHide();
      }}
      className="create-case-dialog themed-dialog"
      blockScroll
    >
      <Toast ref={toast} />
      {currentStep < 4 && (
        <Steps
          model={stepItems}
          activeIndex={currentStep}
          readOnly={true}
          className="p-mb-5 themed-steps"
        />
      )}

      {error && error.error && (
        <Message severity="error" text={error.error} className="p-mb-3" />
      )}
      {(currentStep === 0 || currentStep === 2) &&
        Object.keys(error).length > 0 &&
        !error.error && (
          <Message
            severity="error"
            text={
              Object.values(error).find((msg) => typeof msg === "string") ||
              "Please correct the highlighted fields."
            }
            className="p-mb-3"
          />
        )}

      <div className="dialog-content">
        {currentStep === 0 && (
          <div className="p-fluid p-grid p-formgrid case-details-grid">
            <div className="p-col-12">
              <h5></h5>
              <div className="p-grid p-formgrid mandatory-grid">
                {fieldsConfig.mandatory.map((field) =>
                  renderMandatoryField(field),
                )}
              </div>
            </div>
            <div className="p-col-12">
              <h5> </h5>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fieldsConfig.customLabels.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fieldsConfig.customLabels.map((label) => (
                    <SortableLabel key={label.id} label={label} />
                  ))}
                </SortableContext>
              </DndContext>
              {renderAddLabelForm()}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="p-fluid file-upload-step">
            {error && error.upload && (
              <Message
                severity="error"
                text={error.upload}
                className="p-mb-3"
              />
            )}
            <h5>
              Upload Documents for Case:{" "}
              {_entity.vinsPartnershipReference || "N/A"}
            </h5>
            <p className="p-text-secondary p-mb-3">
              Upload files relevant to the case (max 2 plaintiff files, at least
              1 document required).
            </p>
            <TabView>
              <TabPanel header="Plaintiff Files">
                <UploadFilesToS3
                  key="plaintiff-uploader"
                  serviceName="caseDocuments"
                  id={null}
                  user={props.user}
                  parentToastRef={toast}
                  onUploadComplete={(ids) =>
                    handleUploadAndSave(ids, "plaintiff")
                  }
                  accept="application/pdf,image/*"
                  multiple={true}
                  disabled={
                    uploading.plaintiff ||
                    categorizedFiles.plaintiff.length >= 2
                  }
                />
                {uploading.plaintiff && (
                  <ProgressBar
                    mode="indeterminate"
                    style={{ height: "6px", marginTop: "10px" }}
                  />
                )}
                {renderFileList("plaintiff")}
              </TabPanel>
              <TabPanel header="Adjuster Report">
                <UploadFilesToS3
                  key="adjuster-uploader"
                  serviceName="caseDocuments"
                  id={null}
                  user={props.user}
                  parentToastRef={toast}
                  onUploadComplete={(ids) =>
                    handleUploadAndSave(ids, "adjuster")
                  }
                  accept="application/pdf,image/*"
                  multiple={true}
                  disabled={uploading.adjuster}
                />
                {uploading.adjuster && (
                  <ProgressBar
                    mode="indeterminate"
                    style={{ height: "6px", marginTop: "10px" }}
                  />
                )}
                {renderFileList("adjuster")}
              </TabPanel>
              <TabPanel header="Medical Files">
                <UploadFilesToS3
                  key="medical-uploader"
                  serviceName="caseDocuments"
                  id={null}
                  user={props.user}
                  parentToastRef={toast}
                  onUploadComplete={(ids) =>
                    handleUploadAndSave(ids, "medical")
                  }
                  accept="application/pdf,image/*"
                  multiple={true}
                  disabled={uploading.medical}
                />
                {uploading.medical && (
                  <ProgressBar
                    mode="indeterminate"
                    style={{ height: "6px", marginTop: "10px" }}
                  />
                )}
                {renderFileList("medical")}
              </TabPanel>
            </TabView>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-fluid p-grid p-formgrid additional-info-grid">
            <h5>Additional Information</h5>
            <p className="p-text-secondary p-mb-3">
              {/* Provide additional details for the case. All fields are optional. */}
            </p>
            {fieldsConfig.additionalInfo.map((fieldConfig) =>
              renderAdditionalInfoField(fieldConfig),
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="p-fluid">
            <h5>Review and Submit</h5>
            <p>
              Please review the case details, additional information, and
              uploaded documents before submitting.
            </p>
            <div className="p-grid p-formgrid p-mb-3">
              {fieldsConfig.mandatory.map((field) => (
                <div key={field.id} className="p-field p-col-12 p-md-6">
                  <label>{field.label}:</label> {_entity[field.key] || "N/A"}
                </div>
              ))}
              {fieldsConfig.customLabels.map((label) => (
                <div key={label.id} className="p-field p-col-12">
                  <h6>{label.label}</h6>
                  {label.fields.map((field) => (
                    <div key={field.id} className="p-ml-4">
                      <label>
                        {field.key === "claimStatus"
                          ? "Status"
                          : field.key === "claimStatusDate"
                            ? "Status Date"
                            : "Field"}
                        :
                      </label>{" "}
                      {_entity.caseDetails
                        .find((l) => l.label === label.label)
                        ?.fields.find((f) => f.key === field.key)?.value ||
                        "N/A"}
                    </div>
                  ))}
                </div>
              ))}
              <div className="p-field p-col-12">
                <h6>Additional Information</h6>
                <div className="p-ml-4">
                  <div>
                    <label>Partners:</label>{" "}
                    {_entity.additionalInfo.partners
                      .map((p) => p.value || "N/A")
                      .filter((v) => v !== "N/A")
                      .join(", ") || "N/A"}
                  </div>
                  <div>
                    <label>Legal Assistants:</label>{" "}
                    {_entity.additionalInfo.legalAssistants
                      .map((la) => la.value || "N/A")
                      .filter((v) => v !== "N/A")
                      .join(", ") || "N/A"}
                  </div>
                  <div>
                    <label>Insurance Company:</label>{" "}
                    {_entity.additionalInfo.insuranceCompany || "N/A"}
                  </div>
                  <div>
                    <label>Date:</label>{" "}
                    {_entity.additionalInfo.additionalInfoDate || "N/A"}
                  </div>
                  <div>
                    <label>Recipient:</label>{" "}
                    {_entity.additionalInfo.additionalRecipient || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <h6>Uploaded Documents:</h6>
            <div className="p-ml-2">
              <p>
                <b>Plaintiff Files:</b> {categorizedFiles.plaintiff.length}{" "}
                file(s) (0-2 allowed)
              </p>
              <p>
                <b>Adjuster Reports:</b> {categorizedFiles.adjuster.length}{" "}
                file(s)
              </p>
              <p>
                <b>Medical Files:</b> {categorizedFiles.medical.length} file(s)
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="p-fluid p-text-center confirmation-step">
            <i className="pi pi-check-circle confirmation-icon"></i>
            <h3 className="p-my-3">Case Submitted Successfully!</h3>
            <p className="p-text-secondary">
              Case Number:{" "}
              <strong>{_entity?.vinsPartnershipReference || "N/A"}</strong>
            </p>
            <p className="p-text-secondary">
              Your case details and documents have been submitted.
            </p>
            <p className="p-text-secondary">
              File extraction queued for uploaded documents.
            </p>
            <div className="p-mt-4">
              <Button
                label="Go to Homepage"
                icon="pi pi-home"
                onClick={handleHomepage}
                className="p-button-secondary p-button-outlined"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        :root {
          --theme-primary: #511718;
          --theme-secondary: #260b0b;
          --theme-text-on-dark: #f8f9fa;
          --theme-text-on-light: #260b0b;
          --theme-background: #f4f5f7;
          --theme-panel-bg: #ffffff;
          --theme-muted-bg: #f8f9fa;
          --theme-border: #d1d5db;
          --theme-primary-hover: #401213;
          --green-500: #22c55e;
          --red-500: #ef4444;
        }
        .create-case-dialog .p-dialog-header {
          background-color: var(--theme-secondary);
          color: var(--theme-text-on-dark);
          border-bottom: none;
          padding: 1rem 1.5rem;
          border-radius: 6px 6px 0 0;
        }
        .create-case-dialog .p-dialog-title {
          font-weight: 600;
        }
        .create-case-dialog .p-dialog-header-icon {
          color: var(--theme-text-on-dark) !important;
        }
        .create-case-dialog .p-dialog-content {
          padding: 1.5rem 2rem 1rem 2rem;
          background-color: var(--theme-panel-bg);
        }
        .create-case-dialog .p-dialog-footer {
          padding: 1rem 2rem 1.5rem 2rem;
          border-top: 1px solid var(--theme-border);
          background-color: var(--theme-muted-bg);
          border-radius: 0 0 6px 6px;
        }
        .dialog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .themed-steps.p-steps {
          margin-bottom: 2.5rem !important;
        }
        .themed-steps .p-steps-item {
          flex: 1 1 auto;
          position: relative;
        }
        .themed-steps .p-steps-item .p-menuitem-link {
          background-color: transparent;
        }
        .themed-steps .p-steps-item.p-highlight .p-steps-number {
          background: var(--theme-primary);
          color: var(--theme-text-on-dark);
        }
        .themed-steps .p-steps-item.p-highlight .p-steps-title {
          color: var(--theme-primary);
          font-weight: 600;
        }
        .themed-steps .p-steps-number {
          border: 2px solid var(--theme-border);
          color: var(--theme-text-on-light);
          background: var(--theme-panel-bg);
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 2.5rem;
          height: 2.5rem;
          font-weight: 600;
          transition:
            background-color 0.2s,
            color 0.2s,
            border-color 0.2s;
          position: relative;
          z-index: 1;
        }
        .themed-steps .p-steps-title {
          color: var(--theme-text-on-light);
          margin-top: 0.5rem;
          font-weight: 500;
        }
        .themed-steps .p-steps-item:not(:first-child):before {
          content: "";
          border-top: 2px solid var(--theme-border);
          width: calc(100% - 2.5rem);
          top: 1.25rem;
          left: calc(-50% + 1.25rem);
          position: absolute;
          z-index: 0;
        }
        .themed-steps .p-steps-item.p-highlight:not(:first-child):before,
        .themed-steps .p-steps-item.p-highlight ~ .p-steps-item:before {
          border-top-color: var(--theme-primary);
        }
        .themed-steps .p-steps-item:first-child:before {
          display: none;
        }
        .create-case-dialog .p-field label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--theme-secondary);
          font-weight: 500;
        }
        .create-case-dialog .p-field-label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--theme-secondary);
          font-weight: 500;
        }
        .input-themed.p-inputtext,
        .input-themed .p-inputtext,
        .input-themed.p-dropdown .p-dropdown,
        .input-themed.p-calendar {
          border-color: var(--theme-border);
          border-radius: 4px;
          width: 100%;
        }
        .input-themed.p-inputtext.p-invalid,
        .input-themed.p-dropdown.p-invalid .p-dropdown,
        .input-themed.p-calendar.p-invalid .p-inputtext {
          border-color: var(--red-500);
        }
        .input-themed.p-inputtext:enabled:focus,
        .input-themed .p-inputtext:enabled:focus,
        .input-themed.p-dropdown .p-dropdown:focus,
        .input-themed.p-calendar:enabled:focus-within {
          border-color: var(--theme-primary);
          box-shadow: 0 0 0 1px var(--theme-primary);
        }
        .file-upload-step {
          padding: 1rem;
        }
        .file-upload-step .p-tabview-panels {
          padding: 1rem 0 0 0;
        }
        .p-list-none {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .p-list-none li {
          border-bottom: 1px solid var(--surface-d);
          padding: 0.5rem 0;
        }
        .p-list-none li:last-child {
          border-bottom: none;
        }
        .confirmation-step .confirmation-icon {
          font-size: 4rem !important;
          color: var(--green-500) !important;
        }
        .themed-button-prime {
          background: var(--theme-primary);
          border-color: var(--theme-primary);
          color: var(--theme-text-on-dark);
        }
        .themed-button-prime:enabled:hover {
          background: var(--theme-primary-hover);
          border-color: var(--theme-primary-hover);
        }
        .themed-button-success {
          background: #15803d;
          border-color: #15803d;
        }
        .themed-button-success:enabled:hover {
          background: #166534;
          border-color: #166534;
        }
        .draggable-label {
          border: 1px solid var(--theme-border);
          padding: 1rem;
          border-radius: 4px;
          background-color: var(--theme-panel-bg);
        }

        .label-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .label-header .p-d-flex.p-ai-center {
          display: flex;
          align-items: center;
        }

        .drag-handle {
          cursor: grab;
          color: var(--theme-text-on-light);
          font-size: 1.2rem;
        }

        .label-title {
          margin: 0;
          // font-size: 1.1rem;
          font-weight: 500;
          color: var(--theme-text-on-light);
        }

        .custom-fields-grid {
          margin-top: 0.5rem;
        }

        .field-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .icon-sm {
          width: 1.5rem;
          height: 1.5rem;
          font-size: 0.875rem;
        }

        .create-case-dialog .p-field label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--theme-secondary);
          font-weight: 500;
        }
        .create-case-dialog .p-field-label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--theme-secondary);
          font-weight: 500;
        }
        .input-themed.p-inputtext,
        .input-themed .p-inputtext,
        .input-themed.p-dropdown .p-dropdown,
        .input-themed.p-calendar {
          border-color: var(--theme-border);
          border-radius: 4px;
          width: 100%;
        }
        .input-themed.p-inputtext.p-invalid,
        .input-themed.p-dropdown.p-invalid .p-dropdown,
        .input-themed.p-calendar.p-invalid .p-inputtext {
          border-color: var(--red-500);
        }
        .input-themed.p-inputtext:enabled:focus,
        .input-themed .p-inputtext:enabled:focus,
        .input-themed.p-dropdown .p-dropdown:focus,
        .input-themed.p-calendar:enabled:focus-within {
          border-color: var(--theme-primary);
          box-shadow: 0 0 0 1px var(--theme-primary);
        }
        .file-upload-step {
          padding: 1rem;
        }
        .file-upload-step .p-tabview-panels {
          padding: 1rem 0 0 0;
        }
        .p-list-none {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .p-list-none li {
          border-bottom: 1px solid var(--surface-d);
          padding: 0.5rem 0;
        }
        .p-list-none li:last-child {
          border-bottom: none;
        }
        .confirmation-step .confirmation-icon {
          font-size: 4rem !important;
          color: var(--green-500) !important;
        }
        .themed-button-prime {
          background: var(--theme-primary);
          border-color: var(--theme-primary);
          color: var(--theme-text-on-dark);
        }
        .themed-button-prime:enabled:hover {
          background: var(--theme-primary-hover);
          border-color: var(--theme-primary-hover);
        }
        .themed-button-success {
          background: #15803d;
          border-color: #15803d;
        }
        .themed-button-success:enabled:hover {
          background: #166534;
          border-color: #166534;
        }
        .draggable-label {
          border: 1px solid var(--theme-border);
          border-radius: 4px;
          padding: 1rem;
          background-color: var(--theme-muted-bg);
          margin-bottom: 1rem;
        }
        .label-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .label-title {
          margin: 0;
          // font-size: 1.1rem;
          color: var(--theme-secondary);
        }
        .drag-handle {
          cursor: move;
          color: var(--theme-secondary);
        }
        .icon-sm {
          width: 1.5rem !important;
          height: 1.5rem !important;
          font-size: 0.875rem !important;
        }
        .field-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }
        .case-details-grid {
          max-height: calc(70vh - 100px);
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .custom-fields-grid,
        .mandatory-grid,
        .additional-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          width: 100%;
        }
        .custom-field,
        .mandatory-field,
        .additional-info-field {
          display: flex;
          flex-direction: column;
        }
        .custom-field .p-inputtext,
        .mandatory-field .p-inputtext,
        .additional-info-field .p-inputtext,
        .custom-field .p-dropdown,
        .custom-field .p-calendar,
        .additional-info-field .p-calendar {
          width: 100%;
        }
        @media (max-width: 768px) {
          .custom-fields-grid,
          .mandatory-grid,
          .additional-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default connect(
  (state) => ({
    user: state.auth.user,
  }),
  (dispatch) => ({
    alert: (data) => dispatch({ type: "ALERT", payload: data }),
  }),
)(CreateCaseDialogStyled);
