import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useParams } from "react-router-dom";
import { Steps } from "primereact/steps";
import { Message } from "primereact/message";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import client from "../../../services/restClient";
import UploadFilesToS3 from "../../../services/UploadFilesToS3";
import _ from "lodash";

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
    {
      primary: "represent",
      synonyms: "warrant, covenant, undertake",
    },
    {
      primary: "representation",
      synonyms: "warranty, covenant, undertaking, assurance, guarantee",
    },
    {
      primary: "negative",
      synonyms: "restrictive",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [_entity, set_entity] = useState({
    collisionDateTime: null, // Initialize collisionDateTime
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const toast = useRef(null);
  const urlParams = useParams();

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

  const stepItems = [
    { label: "Case Details", command: () => setError({}) },
    { label: "Upload Documents", command: () => setError({}) },
    { label: "Review and Submit", command: () => setError({}) },
  ];

  const typeOfClaimsOptions = [
    { label: "Accident Claims", value: "accident" },
    { label: "Medical Claims", value: "medical" },
    { label: "Corporate Claims", value: "corporate" },
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
    { label: "Klang High Court", value: "Klang High Court" },
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

  const claimStatusOptions = [
    { label: "FILED", value: "FILED" },
    { label: "UNDER REVIEW", value: "UNDER REVIEW" },
    { label: "PENDING DOCUMENTS", value: "PENDING DOCUMENTS" },
    { label: "SETTLEMENT IN PROGRESS", value: "SETTLEMENT IN PROGRESS" },
    { label: "APPROVED", value: "APPROVED" },
    { label: "PAID & CLOSED", value: "PAID & CLOSED" },
    { label: "DENIED", value: "DENIED" },
    { label: "APPEAL FILED", value: "APPEAL FILED" },
    { label: "IN THE COURT (LITIGATION)", value: "IN THE COURT (LITIGATION)" },
    { label: "JUDGMENT ISSUED", value: "JUDGMENT ISSUED" },
  ];

  useEffect(() => { }, []);

  const setValByKey = (key, val) => {
    set_entity((prev) => ({ ...prev, [key]: val }));
    setError((prev) => _.omit(prev, key));
  };

  const handleUploadAndSave = async (documentStorageIds, category) => {
    if (!createdCaseId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Case ID not found. Cannot save documents.",
        life: 4000,
      });
      return;
    }
    if (!documentStorageIds || documentStorageIds.length === 0) return;

    setUploading((prev) => ({ ...prev, [category]: true }));

    let successCount = 0;
    const addedFilesInfo = [];
    const errorMessages = [];

    let docTypeString = category;
    if (category === "plaintiff") {
      docTypeString = "Plaintiff File";
    } else if (category === "adjuster") {
      docTypeString = "Adjuster Report";
    } else if (category === "medical") {
      docTypeString = "Medical File";
    }

    for (const docStorageId of documentStorageIds) {
      const caseDocData = {
        summonsNo: createdCaseId,
        uploadedDocument: [docStorageId],
        documentType: docTypeString,
        uploadTimestamp: new Date(),
        createdBy: props.user._id,
        updatedBy: props.user._id,
      };

      try {
        console.log(
          `Creating caseDocument for docStorageId: ${docStorageId} with data:`,
          caseDocData,
        );
        const caseDocResult = await client
          .service("caseDocuments")
          .create(caseDocData);
        const docStorageResult = await client
          .service("documentStorages")
          .get(docStorageId);

        await client.service("documentStorages").patch(docStorageId, {
          tableId: caseDocResult._id,
          tableName: "caseDocuments",
        });

        // Queue text extraction job for this document
        const queueData = {
          caseDocumentId: caseDocResult._id,
          documentStorageId: docStorageId,
          documentType: docTypeString,
          summonsNo: createdCaseId,
          createdBy: props.user._id,
          updatedBy: props.user._id,
        };

        try {
          await client.service("textExtractionQueues").create(queueData);
          console.log(
            `Successfully queued text extraction for CaseDoc ${caseDocResult._id} (${docTypeString})`,
          );
        } catch (queueErr) {
          console.error(
            `Failed to queue text extraction for CaseDoc ${caseDocResult._id}:`,
            queueErr,
          );
          errorMessages.push(
            `Failed to queue text extraction for document ${docStorageId.substring(0, 6)}`,
          );
        }

        addedFilesInfo.push({
          documentStorageId: docStorageId,
          caseDocumentId: caseDocResult._id,
          name:
            docStorageResult.originalFileName ||
            `Document ${docStorageId.substring(0, 6)}`,
        });
        successCount++;
      } catch (err) {
        const errorDetail =
          err.message ||
          `Failed to save document ${docStorageId.substring(0, 6)}`;
        console.error(
          `Error saving document (ID: ${docStorageId}) for category ${category}:`,
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
        detail: `${successCount} file(s) saved successfully for ${category}. Text extraction queued.`,
        life: 3000,
      });
    }
    if (errorMessages.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Document Save Error",
        detail: `${errorMessages.length} file(s) failed to save or queue: ${errorMessages.join(", ")}`,
        life: 5000,
      });
    }

    setUploading((prev) => ({ ...prev, [category]: false }));
  };

  const handleRemoveFile = async (fileInfoToRemove, category) => {
    if (
      !fileInfoToRemove?.caseDocumentId ||
      !fileInfoToRemove?.documentStorageId
    ) {
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
      // Remove any associated text extraction queue entries
      const queueEntries = await client.service("textExtractionQueues").find({
        query: {
          caseDocumentId: fileInfoToRemove.caseDocumentId,
          status: { $in: ["queued", "processing"] },
        },
      });

      for (const queueEntry of queueEntries.data) {
        await client.service("textExtractionQueues").remove(queueEntry._id);
        console.log(`Removed text extraction queue entry ${queueEntry._id}`);
      }

      await client
        .service("caseDocuments")
        .remove(fileInfoToRemove.caseDocumentId);
      await client
        .service("documentStorages")
        .remove(fileInfoToRemove.documentStorageId);

      setCategorizedFiles((prev) => ({
        ...prev,
        [category]: prev[category].filter(
          (f) => f.caseDocumentId !== fileInfoToRemove.caseDocumentId,
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
        `Error removing file (CaseDocID: ${fileInfoToRemove.caseDocumentId}):`,
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

  const validateStep0 = () => {
    let isValid = true;
    const errors = {};
    const requiredFields = [
      "insuranceRef",
      "vinsPartnershipReference",
      "summonsNo",
      // "court",
      // "plaintiffSolicitors",
      // "plaintiff",
      // "insuredDriver",
      // "insured",
      // "insuredVehicle",
      // "claimStatus",
      // "typeOfClaims",
      // "collisionDateTime", // Added collisionDateTime
      // "claimStatusDate",
      // "recipientName",
      // "recipientDepartment"
    ];

    requiredFields.forEach((field) => {
      if (_.isEmpty(_entity[field]?.toString())) {
        errors[field] =
          `${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required`;
        isValid = false;
      }
    });
    setError(errors);
    return isValid;
  };

  const validateStep1 = () => {
    return true;
  };

  const handleNext = async () => {
    setError({});

    if (currentStep === 0) {
      if (!validateStep0()) return;
      setLoading(true);
      const caseData = {
        ..._.pick(_entity, [
          "insuranceRef",
          "vinsPartnershipReference",
          "summonsNo",
          "court",
          "plaintiffSolicitors",
          "plaintiff",
          "insuredDriver",
          "insured",
          "insuredVehicle",
          "collisionDateTime",
          "claimStatus",
          "typeOfClaims",
          "claimStatusDate",
          "recipientName",
          "recipientDepartment"
        ]),
        synonyms: synonymousList.map((item) => ({
          primary: item.primary,
          synonymsList: item.synonyms.split(", ").map((syn) => syn.trim()),
        })),
        createdBy: props.user._id,
        updatedBy: props.user._id,
      };

      try {
        console.log("Sending caseData to backend:", caseData); // Debug log
        const caseResult = await client
          .service("accidentCases")
          .create(caseData);
        setCreatedCaseId(caseResult._id);
        console.log("caseResult", caseResult);
        toast.current?.show({
          severity: "success",
          summary: "Case Created",
          detail: `Case ${caseResult.vinsPartnershipReference} created. Proceed to upload documents.`,
          life: 3000,
        });
        setCurrentStep(1);
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
    } else if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setError({});
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const triggerExtractionJobs = () => {
    const categories = [
      { files: categorizedFiles.plaintiff, docType: "Plaintiff File" },
      { files: categorizedFiles.adjuster, docType: "Adjuster Report" },
      { files: categorizedFiles.medical, docType: "Medical File" },
    ];

    categories.forEach(({ files, docType }) => {
      if (files.length > 0) {
        console.log(
          `Checking extraction jobs for ${files.length} ${docType} files...`,
        );

        const queuePromises = files.map((fileInfo) => {
          // Check if a queue entry already exists
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
                  return { success: true, fileInfo };
                })
                .catch((err) => {
                  console.error(
                    `Failed to create queue record for ${fileInfo.name} (CaseDocID: ${fileInfo.caseDocumentId}):`,
                    err,
                  );
                  toast.current?.show({
                    severity: "warn",
                    summary: "Extraction Queueing Failed",
                    detail: `Could not add ${docType} file to processing queue: ${fileInfo.name}`,
                    life: 5000,
                  });
                  return { error: err, fileInfo };
                });
            });
        });

        Promise.allSettled(queuePromises).then((results) => {
          const failedJobs = results.filter(
            (r) =>
              r.status === "rejected" ||
              (r.status === "fulfilled" && r.value?.error),
          );
          const skippedJobs = results.filter(
            (r) => r.status === "fulfilled" && r.value?.skipped,
          );
          if (failedJobs.length > 0) {
            console.warn(
              `${failedJobs.length} ${docType} extraction job(s) failed to queue.`,
            );
          }
          if (skippedJobs.length > 0) {
            console.log(
              `${skippedJobs.length} ${docType} extraction job(s) already queued, skipped.`,
            );
          }
          if (failedJobs.length === 0 && skippedJobs.length < files.length) {
            console.log(
              `Successfully queued ${files.length - skippedJobs.length} new ${docType} file extraction jobs.`,
            );
          }
        });
      } else {
        console.log(`No ${docType} files found to queue for extraction.`);
      }
    });
  };

  const handleSubmit = async () => {
    if (currentStep !== 2) return;
    setLoading(true);

    try {
      const eagerCaseResult = await client.service("accidentCases").find({
        query: { $limit: 1, _id: createdCaseId },
      });

      if (eagerCaseResult.data.length > 0) {
        props.onCaseCreated(eagerCaseResult.data[0]);
      }

      triggerExtractionJobs();

      props.alert({
        type: "success",
        title: "Case Submitted",
        message:
          "Case submitted. Document processing started for uploaded files (if applicable).",
      });
      setCurrentStep(3);
    } catch (err) {
      console.error("Error fetching final case data or triggering jobs:", err);
      props.alert({
        type: "warning",
        title: "Submission Warning",
        message:
          "Case submitted, but failed to fetch final details or trigger background processing.",
      });
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleHomepage = () => {
    setCurrentStep(0);
    set_entity({
      collisionDateTime: null, // Reset collisionDateTime
    });
    setError({});
    setCreatedCaseId(null);
    setCategorizedFiles({ plaintiff: [], adjuster: [], medical: [] });
    setUploading({ plaintiff: false, adjuster: false, medical: false });
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
            key={fileInfo.caseDocumentId || fileInfo.documentStorageId}
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

  const renderFooter = () => (
    <div className="dialog-footer">
      <div>
        {currentStep > 0 && currentStep < 3 && (
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
        {currentStep < 2 && (
          <Button
            label={currentStep === 0 ? "Create Case & Next" : "Review & Submit"}
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleNext}
            loading={loading && currentStep === 0}
            disabled={
              loading ||
              uploading.plaintiff ||
              uploading.adjuster ||
              uploading.medical
            }
            className="themed-button-prime"
          />
        )}
        {currentStep === 2 && (
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
      footer={currentStep < 3 ? renderFooter() : null}
      onHide={() => {
        if (currentStep !== 3) props.onHide();
      }}
      className="create-case-dialog themed-dialog"
      blockScroll
    >
      <Toast ref={toast} />
      {currentStep < 3 && (
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
      {currentStep === 0 && Object.keys(error).length > 0 && !error.error && (
        <Message
          severity="error"
          text={
            Object.values(error).find((msg) => typeof msg === "string") ||
            "Please correct the highlighted fields."
          }
          className="p-mb-3"
        />
      )}
      {currentStep === 1 && error.upload && (
        <Message severity="error" text={error.upload} className="p-mb-3" />
      )}

      <div className="dialog-content">
        {currentStep === 0 && (
          <div className="p-fluid p-grid p-formgrid">
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="caseType">Type of Claims</label>
              <Dropdown
                id="typeOfClaims"
                value={_entity.typeOfClaims}
                options={typeOfClaimsOptions}
                onChange={(e) => setValByKey("typeOfClaims", e.value)}
                placeholder="Select a Type of Claims"
                className={`input-themed ${error.typeOfClaims ? "p-invalid" : ""}`}
              />
              {error.typeOfClaims && (
                <small className="p-error">{error.typeOfClaims}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="insuranceRef">Insurance Ref.</label>
              <InputText
                id="insuranceRef"
                value={_entity.insuranceRef || ""}
                onChange={(e) => setValByKey("insuranceRef", e.target.value)}
                className={`input-themed ${error.insuranceRef ? "p-invalid" : ""}`}
              />
              {error.insuranceRef && (
                <small className="p-error">{error.insuranceRef}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="vinsPartnershipReference">
                Vins Partnership Reference
              </label>
              <InputText
                id="vinsPartnershipReference"
                value={_entity.vinsPartnershipReference || ""}
                onChange={(e) =>
                  setValByKey("vinsPartnershipReference", e.target.value)
                }
                className={`input-themed ${error.vinsPartnershipReference ? "p-invalid" : ""}`}
              />
              {error.vinsPartnershipReference && (
                <small className="p-error">
                  {error.vinsPartnershipReference}
                </small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="summonsNo">Summons No.</label>
              <InputText
                id="summonsNo"
                value={_entity.summonsNo || ""}
                onChange={(e) => setValByKey("summonsNo", e.target.value)}
                className={`input-themed ${error.summonsNo ? "p-invalid" : ""}`}
              />
              {error.summonsNo && (
                <small className="p-error">{error.summonsNo}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="court">Court</label>
              <Dropdown
                id="court"
                value={_entity.court}
                options={courtOptions}
                onChange={(e) => setValByKey("court", e.value)}
                placeholder="Select a Court"
                className={`input-themed ${error.court ? "p-invalid" : ""}`}
                filter
              />
              {error.court && <small className="p-error">{error.court}</small>}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="plaintiffSolicitors">
                Plaintiff's Solicitors
              </label>
              <InputText
                id="plaintiffSolicitors"
                value={_entity.plaintiffSolicitors || ""}
                onChange={(e) =>
                  setValByKey("plaintiffSolicitors", e.target.value)
                }
                className={`input-themed ${error.plaintiffSolicitors ? "p-invalid" : ""}`}
              />
              {error.plaintiffSolicitors && (
                <small className="p-error">{error.plaintiffSolicitors}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="plaintiff">Plaintiff</label>
              <InputText
                id="plaintiff"
                value={_entity.plaintiff || ""}
                onChange={(e) => setValByKey("plaintiff", e.target.value)}
                className={`input-themed ${error.plaintiff ? "p-invalid" : ""}`}
              />
              {error.plaintiff && (
                <small className="p-error">{error.plaintiff}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="insuredDriver">Insured Driver</label>
              <InputText
                id="insuredDriver"
                value={_entity.insuredDriver || ""}
                onChange={(e) => setValByKey("insuredDriver", e.target.value)}
                className={`input-themed ${error.insuredDriver ? "p-invalid" : ""}`}
              />
              {error.insuredDriver && (
                <small className="p-error">{error.insuredDriver}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="insured">Insured</label>
              <InputText
                id="insured"
                value={_entity.insured || ""}
                onChange={(e) => setValByKey("insured", e.target.value)}
                className={`input-themed ${error.insured ? "p-invalid" : ""}`}
              />
              {error.insured && (
                <small className="p-error">{error.insured}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="insuredVehicle">Insured Vehicle</label>
              <InputText
                id="insuredVehicle"
                value={_entity.insuredVehicle || ""}
                onChange={(e) => setValByKey("insuredVehicle", e.target.value)}
                className={`input-themed ${error.insuredVehicle ? "p-invalid" : ""}`}
              />
              {error.insuredVehicle && (
                <small className="p-error">{error.insuredVehicle}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="collisionDateTime">
                Date and Time of Collision
              </label>
              <Calendar
                id="collisionDateTime"
                value={_entity.collisionDateTime}
                onChange={(e) => setValByKey("collisionDateTime", e.value)}
                showTime
                hourFormat="24"
                dateFormat="yy-mm-dd"
                placeholder="Select Date and Time"
                className={`input-themed ${error.collisionDateTime ? "p-invalid" : ""}`}
              />
              {error.collisionDateTime && (
                <small className="p-error">{error.collisionDateTime}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="claimStatus">Status of Claim</label>
              <Dropdown
                id="claimStatus"
                value={_entity.claimStatus}
                options={claimStatusOptions}
                onChange={(e) => setValByKey("claimStatus", e.value)}
                placeholder="Select a Status"
                className={`input-themed ${error.claimStatus ? "p-invalid" : ""}`}
              />
              {error.claimStatus && (
                <small className="p-error">{error.claimStatus}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="claimStatusDate">
                Status of Claim Date
              </label>
              <Calendar
                id="claimStatusDate"
                value={_entity.claimStatusDate}
                onChange={(e) => setValByKey("claimStatusDate", e.value)}
                dateFormat="dd/mm/yy"
                placeholder="Select Date"
                className={`input-themed ${error.claimStatusDate ? "p-invalid" : ""}`}
              />
              {error.claimStatusDate && (
                <small className="p-error">{error.claimStatusDate}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="recipientName">Recipient Name</label>
              <InputText
                id="recipientName"
                value={_entity.recipientName || ""}
                onChange={(e) => setValByKey("recipientName", e.target.value)}
                className={`input-themed ${error.recipientName ? "p-invalid" : ""}`}
              />
              {error.recipientName && (
                <small className="p-error">{error.recipientName}</small>
              )}
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="recipientDepartment">Recipient Department</label>
              <InputText
                id="recipientDepartment"
                value={_entity.recipientDepartment || ""}
                onChange={(e) => setValByKey("recipientDepartment", e.target.value)}
                className={`input-themed ${error.recipientDepartment ? "p-invalid" : ""}`}
              />
              {error.recipientDepartment && (
                <small className="p-error">{error.recipientDepartment}</small>
              )}
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
              Upload files relevant to the case. Files are saved automatically
              and text extraction is queued.
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
                  disabled={uploading.plaintiff}
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
          <div className="p-fluid">
            <h5>Review and Submit</h5>
            <p>
              Please review the case details and uploaded documents before
              submitting.
            </p>
            <div className="p-grid p-formgrid p-mb-3">
              <div className="p-field p-col-12 p-md-6">
                <label>Insurance Ref:</label> {_entity.insuranceRef || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Vins Partnership Reference:</label>{" "}
                {_entity.vinsPartnershipReference || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Summons No:</label> {_entity.summonsNo || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Court:</label> {_entity.court || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Plaintiff Solicitors:</label>{" "}
                {_entity.plaintiffSolicitors || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Plaintiff:</label> {_entity.plaintiff || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Insured Driver:</label> {_entity.insuredDriver || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Insured:</label> {_entity.insured || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Insured Vehicle:</label>{" "}
                {_entity.insuredVehicle || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Claim Status:</label> {_entity.claimStatus || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Type of Claims:</label> {_entity.typeOfClaims || "N/A"}
              </div>
              <div className="p-field p-col-12 p-md-6">
                <label>Date and Time of Collision:</label>{" "}
                {_entity.collisionDateTime
                  ? _entity.collisionDateTime.toLocaleString()
                  : "N/A"}
              </div>
            </div>

            <h6>Uploaded Documents:</h6>
            <div className="p-ml-2">
              <p>
                <b>Plaintiff Files:</b> {categorizedFiles.plaintiff.length}{" "}
                file(s) (2 required)
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

        {currentStep === 3 && (
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
              File extraction started in the background for uploaded documents
              (if applicable).
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
          background: #14532d;
          border-color: #14532d;
        }
      `}</style>
    </Dialog>
  );
};

const mapState = (state) => ({
  user: state.auth.user,
});

const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  onCaseCreated: (data) =>
    dispatch({ type: "CREATE_ACCIDENT_CASE_SUCCESS", payload: data }),
});

export default connect(mapState, mapDispatch)(CreateCaseDialogStyled);
