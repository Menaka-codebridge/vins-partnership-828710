import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from "primereact/panel";
import { Tooltip } from "primereact/tooltip";
import { TabView, TabPanel } from "primereact/tabview";
import client from "../../../services/restClient";
import "./BackgroundFacts.styles.css";
import FilesDialog from "./FilesDialog";
import ParametersDialog from "./ParametersDialog";
import SynonymsDialog from "./SynonymsDialog";
import RightSidebar from "./RightSidebar";
import PropTypes from "prop-types";

const CaseInferencePageLayout = ({
  props,
  alert,
  visibleRight: externalVisibleRight,
  setVisibleRight: externalSetVisibleRight,
  setAllSections,
}) => {
  const [localVisibleRight, setLocalVisibleRight] = useState(false);
  const visibleRight =
    externalVisibleRight !== undefined
      ? externalVisibleRight
      : localVisibleRight;
  const setVisibleRight = externalSetVisibleRight || setLocalVisibleRight;

  const { singleAccidentCasesId } = useParams();
  const [summonsNo, setSummonsNo] = useState("");
  const [sectionContent, setSectionContent] = useState({});
  const [opinionSections, setOpinionSections] = useState([]);
  const [allSections, setLocalAllSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(props.section);
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(
    props.activeSubSectionIndex || 0,
  );
  const [currentSubSections, setCurrentSubSections] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [initialInference, setInitialInference] = useState("");
  const [retrievedFromText, setRetrievedFromText] = useState("");
  const [confusionMatrixData, setConfusionMatrixData] = useState(null);
  const [confusionMatrixExplanation, setConfusionMatrixExplanation] =
    useState("");
  const [conclusionText, setConclusionText] = useState("");
  const [currentSectionContentId, setCurrentSectionContentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableInference, setEditableInference] = useState("");
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [showSynonymsDialog, setShowSynonymsDialog] = useState(false);
  const [currentSynonyms, setCurrentSynonyms] = useState([]);
  const [temperature, setTemperature] = useState(0.5);
  const [topK, setTopK] = useState(250);
  const [topP, setTopP] = useState(0.5);
  const [maxLength, setMaxLength] = useState(2048);
  const [expandedGroundTruth, setExpandedGroundTruth] = useState({});
  const [isAccepted, setIsAccepted] = useState(false);
  const [accidentCase, setAccidentCase] = useState(null);
  const [requiredDocumentsAvailable, setRequiredDocumentsAvailable] = useState(
    {},
  );
  const selectedSubSectionValue =
    currentSubSections[activeSubSectionIndex]?.value || null;

  const subsectionDocumentMap = {
    "Adjusters Reports": ["Adjuster Report"],
    "Loss of Earnings": ["Adjuster Report"],
    "Police Reports": ["Plaintiff File"],
    "Sketch Plan": ["Plaintiff File"],
    "Police Findings": ["Plaintiff File"],
    "Police Photographs": ["Plaintiff File"],
    "Opinion On Liability": ["Plaintiff File"],
    "Liability Fraud": ["Plaintiff File"],
    "General Damages": ["Plaintiff File", "Medical File"],
    "Cost of Future Treatments": ["Plaintiff File", "Medical File"],
    "Special Damages": ["Plaintiff File", "Medical File"],
    "Strategy": ["Plaintiff File", "Medical File"],
    "Conclusion": ["Plaintiff File", "Medical File"],
  };

  const SECTION_ORDER = [
    "Background and Facts",
    "Liability",
    "Liability Fraud",
    "Quantum",
    "Strategy",
    "Conclusion",
  ];

  const SUBSECTION_ORDER = {
    "Background and Facts": [
      "Police Reports",
      "Sketch Plan",
      "Police Findings",
      "Police Photographs",
      "Adjusters Reports",
    ],
    Quantum: [
      "General Damages",
      "Loss of Earnings",
      "Special Damages",
      "Cost of Future Treatments",
    ],
  };

  useEffect(() => {
    setSelectedSection(props.section);
    setActiveSubSectionIndex(props.activeSubSectionIndex || 0);
    console.log(
      "Selected section:",
      props.section,
      "Subsection index:",
      props.activeSubSectionIndex,
    );
  }, [props.section, props.activeSubSectionIndex]);

  const parseConfusionMatrix = (matrixString) => {
    if (!matrixString || typeof matrixString !== "string") return null;
    try {
      const lines = matrixString.split("\n");
      const result = {};
      lines.forEach((line) => {
        const match = line.match(/\(True Positives\):\s*(\d+)/);
        if (match) result.TP = parseInt(match[1], 10);
        const matchFN = line.match(/\(False Negatives\):\s*(\d+)/);
        if (matchFN) result.FN = parseInt(matchFN[1], 10);
        const matchFP = line.match(/\(False Positives\):\s*(\d+)/);
        if (matchFP) result.FP = parseInt(matchFP[1], 10);
        const matchTN = line.match(/\(True Negatives\):\s*(\d+)/);
        if (matchTN) result.TN = parseInt(matchTN[1], 10);
      });
      return {
        TP: result.TP ?? 0,
        FN: result.FN ?? 0,
        FP: result.FP ?? 0,
        TN: result.TN ?? 0,
      };
    } catch (err) {
      console.error("Failed to parse confusion matrix:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchDataWithRetry = async (retries = 3, delay = 2000) => {
      setLoading(true);
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const accidentCaseData = await client
            .service("accidentCases")
            .get(singleAccidentCasesId, {
              query: { $populate: ["createdBy", "updatedBy"] },
            });
          setAccidentCase(accidentCaseData);
          setSummonsNo(accidentCaseData.summonsNo || "");
          setCurrentSynonyms(accidentCaseData.synonyms || []);

          const sectionContentsRes = await client
            .service("sectionContents")
            .find({
              query: {
                summonsNo: singleAccidentCasesId,
                $populate: ["createdBy", "updatedBy", "llmPrompts"],
              },
            });
          const sectionContents = sectionContentsRes.data || [];
          console.log("Raw sectionContents:", sectionContents);

          const content = {};
          const allSectionsMap = {};

          sectionContents.forEach((sc) => {
            const section = sc.section || "Unnamed Section";
            const subsection = sc.subsection || `Subsection_${sc._id}`;

            if (!content[section]) {
              content[section] = {};
              allSectionsMap[section] = {
                label: section,
                value: section,
                subSections: [],
              };
            }

            content[section][subsection] = {
              _id: sc._id,
              initialInference: sc.initialInference || "",
              groundTruth: sc.groundTruth || "",
              promptUsed: sc.promptUsed || "",
              retrievedFrom: sc.retrievedFrom || "",
              confusionMatrix: sc.confusionMatrix || null,
              conclusion: sc.conclusion || "",
              llmPrompts: sc.llmPrompts || null,
            };

            allSectionsMap[section].subSections.push({
              label: subsection,
              value: subsection,
              promptUsed: sc.promptUsed || "",
              groundTruth: sc.groundTruth || "",
            });
          });

          const sortedSections = Object.keys(allSectionsMap)
            .sort((a, b) => {
              const indexA = SECTION_ORDER.indexOf(a);
              const indexB = SECTION_ORDER.indexOf(b);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            })
            .map((section) => {
              const subSections = allSectionsMap[section].subSections;
              if (SUBSECTION_ORDER[section]) {
                const orderedSubsections = [];
                const unorderedSubsections = [...subSections];
                SUBSECTION_ORDER[section].forEach((subName) => {
                  const index = unorderedSubsections.findIndex(
                    (sub) => sub.label === subName,
                  );
                  if (index !== -1) {
                    orderedSubsections.push(unorderedSubsections[index]);
                    unorderedSubsections.splice(index, 1);
                  }
                });
                return {
                  ...allSectionsMap[section],
                  subSections: [...orderedSubsections, ...unorderedSubsections],
                };
              }
              return allSectionsMap[section];
            });

          setSectionContent(content);
          setOpinionSections(sortedSections);
          setLocalAllSections(sortedSections);
          setAllSections(
            sortedSections.filter(
              (section) => section.value !== "Confusion Matrix",
            ),
          );

          const currentSectionData = sortedSections.find(
            (s) => s.value === props.section,
          );
          const sortedSubSections = currentSectionData
            ? currentSectionData.subSections
            : [];
          setCurrentSubSections(sortedSubSections);

          const caseDocsRes = await client.service("caseDocuments").find({
            query: {
              summonsNo: singleAccidentCasesId,
              $populate: ["uploadedDocument"],
            },
          });
          const caseDocs = caseDocsRes.data || [];

          const docAvailability = {};
          Object.keys(subsectionDocumentMap).forEach((subsection) => {
            const requiredDocs = subsectionDocumentMap[subsection];
            const hasRequiredDocs = requiredDocs.every((docType) =>
              caseDocs.some((doc) => doc.documentType === docType),
            );
            docAvailability[subsection] = hasRequiredDocs;
          });
          setRequiredDocumentsAvailable(docAvailability);

          const documents = [];
          const images = [];
          const imageTypes = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "bmp",
            "svg",
            "webp",
          ];

          caseDocs.forEach((doc) => {
            const uploadedDocs = Array.isArray(doc.uploadedDocument)
              ? doc.uploadedDocument
              : [doc.uploadedDocument].filter(Boolean);
            uploadedDocs.forEach((storage) => {
              if (storage && storage.name && storage.url) {
                const fileType =
                  storage.name.split(".").pop()?.toLowerCase() || "file";
                const fileEntry = {
                  id: storage._id,
                  name: storage.name,
                  type: fileType,
                  url: storage.url,
                };
                if (imageTypes.includes(fileType)) {
                  images.push(fileEntry);
                } else {
                  documents.push(fileEntry);
                }
              }
            });
          });

          setCurrentFiles(documents);
          setCurrentImages(images);
          setLoading(false);
          setError("");
          console.log("Fetched data:", {
            sectionContent,
            subSections: sortedSubSections,
            allSections: sortedSections,
          });
          return;
        } catch (error) {
          console.error(`Fetch attempt ${attempt} failed:`, error);
          if (attempt === retries) {
            setError(error.message || "Failed to fetch data");
            setLoading(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    fetchDataWithRetry();
  }, [singleAccidentCasesId, props.section, alert, setAllSections]);

  const openFilesDialog = () => setShowFilesDialog(true);
  const hideFilesDialog = () => setShowFilesDialog(false);
  const openParamsDialog = () => setShowParamsDialog(true);
  const hideParamsDialog = () => setShowParamsDialog(false);
  const openSynonymsDialog = () => setShowSynonymsDialog(true);
  const hideSynonymsDialog = () => setShowSynonymsDialog(false);

  const handleParametersSave = (newParams) => {
    setTemperature(newParams.temperature);
    setTopK(newParams.topK);
    setTopP(newParams.topP);
    setMaxLength(newParams.maxLength);
    setShowParamsDialog(false);
  };

  const handleFilesUploaded = (uploadedFiles) => {
    const newDocs = [];
    const newImgs = [];
    uploadedFiles.forEach((file) => {
      const newFileEntry = {
        name: file.name,
        type: file.name.split(".").pop()?.toLowerCase() || "file",
        id: `new_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      };
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
      if (imageTypes.includes(newFileEntry.type)) {
        newImgs.push(newFileEntry);
      } else {
        newDocs.push(newFileEntry);
      }
    });
    setCurrentFiles((prev) => [...prev, ...newDocs]);
    setCurrentImages((prev) => [...prev, ...newImgs]);
  };

  const handleSynonymsSave = (updatedSynonyms) => {
    setCurrentSynonyms(updatedSynonyms);
    setShowSynonymsDialog(false);
  };

  const handleGenerateLegalDocument = () => {
    console.log(
      "handleGenerateLegalDocument called, setting visibleRight to true",
    );
    setVisibleRight(true);
  };

  const generateConfusionExplanation = (matrix) => {
    if (!matrix || typeof matrix !== "object") return "";
    let e = [];
    if (matrix.TP !== undefined) e.push(`TP(${matrix.TP}): Correctly present.`);
    if (matrix.FN !== undefined) e.push(`FN(${matrix.FN}): Missing in Infer.`);
    if (matrix.FP !== undefined) e.push(`FP(${matrix.FP}): Extra in Infer.`);
    if (matrix.TN !== undefined) e.push(`TN(${matrix.TN}): Correctly absent.`);
    return e.join(" ");
  };

  const renderConfusionMatrix = (matrix) => {
    if (!matrix || typeof matrix !== "object") {
      return <p className="p-text-italic p-text-center p-m-0">N/A</p>;
    }
    return (
      <table className="confusion-matrix-table">
        <thead>
          <tr>
            <th></th>
            <th>Predicted Positive</th>
            <th>Predicted Negative</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <b>Actual Positive</b>
            </td>
            <td>{matrix.TP ?? "-"}</td>
            <td>{matrix.FN ?? "-"}</td>
          </tr>
          <tr>
            <td>
              <b>Actual Negative</b>
            </td>
            <td>{matrix.FP ?? "-"}</td>
            <td>{matrix.TN ?? "-"}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const loadContent = useCallback(() => {
    setError("");
    setIsResultsExpanded(false);
    const sectionData = sectionContent[selectedSection];
    let content = null;
    if (
      sectionData &&
      currentSubSections.length > 0 &&
      activeSubSectionIndex < currentSubSections.length
    ) {
      const subSectionValue = currentSubSections[activeSubSectionIndex]?.value;
      content = sectionData[subSectionValue];
    }
    const matrix = content?.confusionMatrix
      ? parseConfusionMatrix(content.confusionMatrix)
      : null;
    const explanation = matrix ? generateConfusionExplanation(matrix) : "";
    setInitialInference(content?.initialInference || "");
    setEditableInference(content?.initialInference || "");
    setCurrentSectionContentId(content?._id || null);
    setUserPrompt(content?.promptUsed || "");
    setRetrievedFromText(content?.retrievedFrom || "");
    setConfusionMatrixData(matrix);
    setConfusionMatrixExplanation(explanation);
    setConclusionText(content?.conclusion || "");
    setIsEditing(false);
    setIsAccepted(!!content?.groundTruth);
    console.log("Loaded content:", {
      selectedSection,
      subSection: selectedSubSectionValue,
      content,
      activeSubSectionIndex,
    });
  }, [
    selectedSection,
    activeSubSectionIndex,
    currentSubSections,
    sectionContent,
    selectedSubSectionValue,
  ]);

  const handlePromptSubmit = async () => {
    if (!selectedSection || !userPrompt) {
      setError("Select section and enter prompt.");
      return;
    }
    const subSectionValue = currentSubSections[activeSubSectionIndex]?.value;
    if (!requiredDocumentsAvailable[subSectionValue]) {
      setError("Required documents not uploaded for this subsection.");
      alert({
        severity: "error",
        summary: "Missing Documents",
        detail: "Please upload the required documents for this subsection.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setInitialInference("");
    setConfusionMatrixData(null);
    setConfusionMatrixExplanation("");
    setConclusionText("");
    setIsResultsExpanded(false);

    try {
      const sectionData = sectionContent[selectedSection];
      const subSectionValue = currentSubSections[activeSubSectionIndex]?.value;
      const content = sectionData?.[subSectionValue];
      if (!content?._id) {
        throw new Error("Section content ID not found.");
      }

      await client.service("sectionContents").patch(content._id, {
        promptUsed: userPrompt,
        updatedAt: new Date(),
        updatedBy: "67eea6f8dfc548354ff6b9d1",
      });

      const queueEntry = await client.service("promptQueues").create({
        sectionContentId: content._id,
        summonsNo: singleAccidentCasesId,
        promptUsed: userPrompt,
        status: "queued",
        errorMessage: "",
        createdBy: "67eea6f8dfc548354ff6b9d1",
        updatedBy: "67eea6f8dfc548354ff6b9d1",
      });

      setSectionContent((prev) => ({
        ...prev,
        [selectedSection]: {
          ...prev[selectedSection],
          [subSectionValue]: {
            ...prev[selectedSection][subSectionValue],
            promptUsed: userPrompt,
          },
        },
      }));
      setLocalAllSections((prev) =>
        prev.map((section) =>
          section.value === selectedSection
            ? {
                ...section,
                subSections: section.subSections.map((sub) =>
                  sub.value === subSectionValue
                    ? { ...sub, promptUsed: userPrompt }
                    : sub,
                ),
              }
            : section,
        ),
      );
      setAllSections((prev) =>
        prev
          .map((section) =>
            section.value === selectedSection
              ? {
                  ...section,
                  subSections: section.subSections.map((sub) =>
                    sub.value === subSectionValue
                      ? { ...sub, promptUsed: userPrompt }
                      : sub,
                  ),
                }
              : section,
          )
          .filter((section) => section.value !== "Confusion Matrix"),
      );
      setUserPrompt("");
      alert({
        severity: "success",
        summary: "Prompt Queued",
        detail: "Prompt has been queued for processing.",
      });

      let pollCount = 0;
      const maxPolls = 60;
      const pollInterval = setInterval(async () => {
        try {
          const queueStatus = await client
            .service("promptQueues")
            .get(queueEntry._id);
          if (queueStatus.status === "failed") {
            clearInterval(pollInterval);
            setLoading(false);
            setError(queueStatus.errorMessage || "Prompt processing failed.");
            alert({
              severity: "error",
              summary: "Prompt Processing Failed",
              detail: queueStatus.errorMessage || "Prompt processing failed.",
            });
            return;
          }

          const updatedContent = await client
            .service("sectionContents")
            .get(content._id);
          if (updatedContent.initialInference) {
            const matrix = updatedContent.confusionMatrix
              ? parseConfusionMatrix(updatedContent.confusionMatrix)
              : null;
            const explanation = matrix
              ? generateConfusionExplanation(matrix)
              : "";
            setInitialInference(updatedContent.initialInference);
            setEditableInference(updatedContent.initialInference);
            setRetrievedFromText(updatedContent.retrievedFrom || "");
            setConfusionMatrixData(matrix);
            setConfusionMatrixExplanation(explanation);
            setConclusionText(updatedContent.conclusion || "");
            setSectionContent((prev) => ({
              ...prev,
              [selectedSection]: {
                ...prev[selectedSection],
                [subSectionValue]: {
                  ...prev[selectedSection][subSectionValue],
                  initialInference: updatedContent.initialInference,
                  retrievedFrom: updatedContent.retrievedFrom,
                  confusionMatrix: updatedContent.confusionMatrix,
                  conclusion: updatedContent.conclusion,
                },
              },
            }));
            clearInterval(pollInterval);
            setLoading(false);
          }

          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setLoading(false);
            setError("Prompt processing timed out. Please try again.");
            alert({
              severity: "error",
              summary: "Timeout",
              detail: "Prompt processing took too long. Please try again.",
            });
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to queue prompt.");
      alert({
        severity: "error",
        summary: "Queue Error",
        detail: error.message || "Failed to queue prompt.",
      });
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleAcceptInference = async (inferenceText = null) => {
    const textToAccept = inferenceText || initialInference;
    if (!currentSectionContentId || !textToAccept) return;

    setLoading(true);
    setError("");
    try {
      await client.service("sectionContents").patch(currentSectionContentId, {
        groundTruth: textToAccept,
        updatedAt: new Date(),
        updatedBy: "67eea6f8dfc548354ff6b9d1",
      });

      setIsAccepted(true);
      setIsEditing(false);
      setLoading(false);

      alert({
        severity: "success",
        summary: "Success",
        detail: "Inference accepted as ground truth",
      });

      const queueEntry = await client.service("promptQueues").create({
        sectionContentId: currentSectionContentId,
        summonsNo: singleAccidentCasesId,
        promptUsed: "Update Confusion Matrix and Conclusion",
        status: "queued",
        errorMessage: "",
        createdBy: "67eea6f8dfc548354ff6b9d1",
        updatedBy: "67eea6f8dfc548354ff6b9d1",
      });

      let pollCount = 0;
      const maxPolls = 60;
      const pollInterval = setInterval(async () => {
        try {
          const queueStatus = await client
            .service("promptQueues")
            .get(queueEntry._id);
          if (queueStatus.status === "failed") {
            clearInterval(pollInterval);
            setLoading(false);
            setError(
              queueStatus.errorMessage || "Confusion Matrix processing failed.",
            );
            alert({
              severity: "error",
              summary: "Confusion Matrix Processing Failed",
              detail:
                queueStatus.errorMessage ||
                "Confusion Matrix processing failed.",
            });
            return;
          }

          const updatedContent = await client
            .service("sectionContents")
            .get(currentSectionContentId);
          if (updatedContent.confusionMatrix) {
            const matrix = updatedContent.confusionMatrix
              ? parseConfusionMatrix(updatedContent.confusionMatrix)
              : null;
            const explanation = updatedContent.confusionMatrix
              ? generateConfusionExplanation(matrix)
              : "";
            setConfusionMatrixData(matrix);
            setConfusionMatrixExplanation(explanation);
            setConclusionText(updatedContent.conclusion);
            setSectionContent((prev) => ({
              ...prev,
              [selectedSection]: {
                ...prev[selectedSection],
                [selectedSubSectionValue]: {
                  ...prev[selectedSection][selectedSubSectionValue],
                  confusionMatrix: updatedContent.confusionMatrix,
                  conclusion: updatedContent.conclusion,
                },
              },
            }));
            clearInterval(pollInterval);
            setLoading(false);
          }

          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setLoading(false);
            setError(
              "Confusion Matrix processing timed out. Please try again.",
            );
            alert({
              severity: "error",
              summary: "Timeout",
              detail:
                "Confusion Matrix processing took too long. Please try again.",
            });
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to accept inference");
      setLoading(false);
      alert({
        severity: "error",
        summary: "Accept Error",
        detail: error.message || "Failed to accept inference",
      });
    }
  };

  const handleEditInference = () => {
    setIsEditing(true);
  };

  const handleSaveAndAccept = async () => {
    if (!currentSectionContentId || !editableInference) return;

    setLoading(true);
    setError("");
    try {
      await client.service("sectionContents").patch(currentSectionContentId, {
        initialInference: editableInference,
        updatedAt: new Date(),
        updatedBy: "67eea6f8dfc548354ff6b9d1",
      });

      setInitialInference(editableInference);
      setIsEditing(false);

      await handleAcceptInference(editableInference);
    } catch (error) {
      setError(error.message || "Failed to update and accept inference");
      setLoading(false);
      alert({
        severity: "error",
        summary: "Update Error",
        detail: error.message || "Failed to update and accept inference",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditableInference(initialInference);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(initialInference)
      .then(() => {
        alert({
          severity: "success",
          summary: "Copied",
          detail: "Inference copied to clipboard",
          life: 2000,
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert({
          severity: "error",
          summary: "Copy Failed",
          detail: "Failed to copy inference to clipboard",
        });
      });
  };

  useEffect(() => {
    const sectionData = opinionSections.find(
      (s) => s.value === selectedSection,
    );
    setCurrentSubSections(sectionData?.subSections || []);
    console.log("Updated currentSubSections:", sectionData?.subSections || []);
  }, [selectedSection, opinionSections]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const toggleGroundTruthExpand = (subSectionValue) => {
    setExpandedGroundTruth((prev) => ({
      ...prev,
      [subSectionValue]: !prev[subSectionValue],
    }));
  };

  const panelHeaderTemplate = (title, isExpanded, expandToggler) => {
    return (
      <div className="panel-header-custom">
        <span>{title}</span>
      </div>
    );
  };

  return (
    <div className="p-m-2 p-p-0 page-container themed-container">
      <div className="page-header themed-header">
        <div className="p-d-flex p-ai-center">
          <h4 className="p-m-0 page-title">
            {opinionSections.find((s) => s.value === selectedSection)?.label ||
              "No Section"}
            {currentSubSections[activeSubSectionIndex]?.label
              ? ` - ${currentSubSections[activeSubSectionIndex].label}`
              : ""}{" "}
            (Case: {summonsNo || "Loading..."})
          </h4>
        </div>
      </div>

      <div
        className="p-m-3 main-content"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 120px)",
        }}
      >
        {loading && (
          <div className="p-text-center">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        )}
        {!loading && error && <p className="p-error">{error}</p>}
        {!loading && !error && currentSubSections.length === 0 && (
          <p className="p-text-center p-mt-3">
            No subsections available for this section.
          </p>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!loading &&
            !error &&
            requiredDocumentsAvailable[selectedSubSectionValue] && (
              <Panel
                headerTemplate={() =>
                  panelHeaderTemplate(
                    "Results",
                    isResultsExpanded,
                    setIsResultsExpanded,
                  )
                }
                className="p-mb-3 results-panel shadow-1 themed-panel"
              >
                <Tooltip target=".results-panel .pi-window-maximize" />
                <Tooltip target=".results-panel .pi-window-minimize" />
                <div className="p-grid results-grid">
                  <div className="p-col-12">
                    <div className="flex justify-content-between align-items-center mb-2">
                      <h5 className="section-title m-0">Infer Statement</h5>
                      <div className="flex gap-2">
                        <Button
                          icon="pi pi-copy"
                          className="p-button-text p-button-sm p-button-secondary"
                          onClick={copyToClipboard}
                          tooltip="Copy to clipboard"
                          tooltipOptions={{ position: "left" }}
                        />
                        <Button
                          icon="pi pi-pencil"
                          className="p-button-text p-button-sm p-button-secondary"
                          onClick={handleEditInference}
                          tooltip="Edit"
                        />
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-column gap-2">
                        <InputTextarea
                          value={editableInference}
                          onChange={(e) => setEditableInference(e.target.value)}
                          rows={10}
                          className="w-full inference-textarea"
                          autoResize
                        />
                        <div className="flex justify-content-end gap-2">
                          <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text p-button-secondary p-button-sm"
                            onClick={handleCancelEdit}
                          />
                          <Button
                            label="Save & Accept"
                            icon="pi pi-check"
                            className="p-button-sm p-button-success"
                            onClick={handleSaveAndAccept}
                            loading={loading}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`content-box ${isResultsExpanded ? "expanded" : ""}`}
                        >
                          {initialInference || "(AI response...)"}
                        </div>
                        <div className="flex justify-content-end mt-3">
                          <Button
                            label="Accept"
                            icon="pi pi-check-circle"
                            className="p-button-sm p-button-success"
                            onClick={() => handleAcceptInference()}
                            disabled={
                              loading ||
                              !currentSectionContentId ||
                              !initialInference
                            }
                            loading={loading}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            )}

          {!loading &&
            !error &&
            !requiredDocumentsAvailable[selectedSubSectionValue] && (
              <p className="p-text-center p-mt-3">
                Infer Statement not available. Required documents are missing
                for this subsection.
              </p>
            )}

          {!loading && !error && (
            <TabView className="p-mt-3 analysis-tabs shadow-1 themed-panel-muted">
              <TabPanel header="Relevant Extracts">
                <div className="retrieved-content-box">
                  {retrievedFromText || "(Source context...)"}
                </div>
              </TabPanel>
              <TabPanel header="Confusion Matrix">
                <div className="p-grid p-ai-start">
                  <div className="p-col-12 p-md-4 p-lg-3">
                    {renderConfusionMatrix(confusionMatrixData)}
                  </div>
                  <div className="p-col-12 p-md-8 p-lg-9">
                    <div className="explanation-box">
                      {confusionMatrixExplanation || "(Explanation...)"}
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Conclusion">
                <div className="conclusion-content-box">
                  {conclusionText || "(Conclusion...)"}
                </div>
              </TabPanel>
            </TabView>
          )}
        </div>

        {!loading && !error && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              padding: "1rem",
              backgroundColor: "#fff",
              borderTop: "1px solid #dee2e6",
              zIndex: 1,
            }}
          >
            <div
              className="p-fluid"
              style={{ display: "flex", alignItems: "center" }}
            >
              <InputTextarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                placeholder="Type your prompt here..."
                className="w-full p-mb-0 prompt-textarea"
                style={{
                  resize: "none",
                  borderRadius: "20px",
                  padding: "0.5rem 1rem",
                  border: "1px solid #ced4da",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                disabled={loading || !selectedSection}
                autoResize
              />
              <Button
                icon="pi pi-send"
                onClick={handlePromptSubmit}
                disabled={!selectedSection || !userPrompt || loading}
                loading={loading}
                className="p-button-rounded p-button-primary p-ml-2"
                style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </div>
            {error && !loading && (
              <p
                className="p-error"
                style={{ display: "block", marginTop: "0.5rem" }}
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <RightSidebar
        visibleRight={visibleRight}
        setVisibleRight={setVisibleRight}
        allSections={allSections}
        expandedGroundTruth={expandedGroundTruth}
        toggleGroundTruthExpand={toggleGroundTruthExpand}
        accidentCase={accidentCase}
        onOpenFilesDialog={openFilesDialog}
        onOpenParamsDialog={openParamsDialog}
        onOpenSynonymsDialog={openSynonymsDialog}
        onGenerateLegalDocument={handleGenerateLegalDocument}
      />

      <FilesDialog
        show={showFilesDialog}
        onHide={hideFilesDialog}
        documents={currentFiles}
        images={currentImages}
        onFilesUpload={handleFilesUploaded}
      />
      <ParametersDialog
        show={showParamsDialog}
        onHide={hideParamsDialog}
        onSave={handleParametersSave}
        initialTemperature={temperature}
        initialTopK={topK}
        initialTopP={topP}
        initialMaxLength={maxLength}
      />
      <SynonymsDialog
        show={showSynonymsDialog}
        onHide={hideSynonymsDialog}
        initialSynonyms={currentSynonyms}
        accidentCaseId={singleAccidentCasesId}
      />
    </div>
  );
};

CaseInferencePageLayout.propTypes = {
  alert: PropTypes.func.isRequired,
  props: PropTypes.object.isRequired,
  visibleRight: PropTypes.bool,
  setVisibleRight: PropTypes.func,
  setAllSections: PropTypes.func.isRequired,
};

CaseInferencePageLayout.defaultProps = {
  visibleRight: undefined,
  setVisibleRight: undefined,
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  show: () => dispatch.loading.show(),
  hide: () => dispatch.loading.hide(),
  get: () => dispatch.cache.get(),
  set: (data) => dispatch.cache.set(data),
});

export default connect(mapState, mapDispatch)(CaseInferencePageLayout);
