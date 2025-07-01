import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from "primereact/panel";
import { TabView, TabPanel } from "primereact/tabview";
import { Tooltip } from "primereact/tooltip";
import { Dialog } from "primereact/dialog";
import client from "../../../services/restClient";
import "./BackgroundFacts.styles.css";
import FilesDialog from "./FilesDialog";
import ParametersDialog from "./ParametersDialog";
import SynonymsDialog from "./SynonymsDialog";

const initialDummyDocuments = [
  { name: "2nd Legal Opinion dated 8.8.2023.pdf", type: "pdf", id: "doc1" },
  { name: "Police Report Scan.pdf", type: "pdf", id: "doc2" },
  { name: "Plaintiff Statement.docx", type: "docx", id: "doc3" },
  { name: "Defendant Statement.docx", type: "docx", id: "doc4" },
  { name: "Medical Report Dr Smith.pdf", type: "pdf", id: "doc5" },
  { name: "Witness Affidavit Jones.docx", type: "docx", id: "doc6" },
  { name: "Repair Quotation.pdf", type: "pdf", id: "doc7" },
  { name: "Loss Adjuster Notes.docx", type: "docx", id: "doc8" },
];
const initialDummyImages = [
  { name: "accident_photo_1.jpg", type: "jpg", id: "img1" },
  { name: "sketch_plan_scan.png", type: "png", id: "img2" },
  { name: "vehicle_damage.jpg", type: "jpg", id: "img3" },
  { name: "site_photo.png", type: "png", id: "img4" },
  { name: "injury_photo_close_up.jpeg", type: "jpeg", id: "img5" },
];
const initialDummySynonyms = [
  {
    primary: "represent",
    synonymsList: ["warrant", "covenant", "undertake"],
    _id: "syn1",
  },
  {
    primary: "representation",
    synonymsList: [
      "warranty",
      "covenant",
      "undertaking",
      "assurance",
      "guarantee",
    ],
    _id: "syn2",
  },
  {
    primary: "obligation",
    synonymsList: ["duty", "responsibility"],
    _id: "syn3",
  },
  {
    primary: "borrower",
    synonymsList: ["customer", "client", "debtor"],
    _id: "syn4",
  },
  {
    primary: "security document",
    synonymsList: [
      "financing document",
      "transaction document",
      "facility documents",
    ],
    _id: "syn5",
  },
  {
    primary: "law",
    synonymsList: ["guideline", "rule", "regulation", "directive", "statute"],
    _id: "syn6",
  },
];

const BackgroundFacts = ({ alert }) => {
  const { singleAccidentCasesId } = useParams();
  const [summonsNo, setSummonsNo] = useState("");
  const [sectionContent, setSectionContent] = useState({});
  const [opinionSections, setOpinionSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    "Background and Facts",
  );
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(0);
  const [currentSubSections, setCurrentSubSections] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [initialInference, setInitialInference] = useState("");
  const [groundTruth, setGroundTruth] = useState("");
  const [retrievedFromText, setRetrievedFromText] = useState("");
  const [confusionMatrixData, setConfusionMatrixData] = useState(null);
  const [confusionMatrixExplanation, setConfusionMatrixExplanation] =
    useState("");
  const [currentSectionContentId, setCurrentSectionContentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditingGroundTruth, setIsEditingGroundTruth] = useState(false);
  const [editableGroundTruth, setEditableGroundTruth] = useState("");
  const [isInferExpanded, setIsInferExpanded] = useState(false);
  const [isGTExpanded, setIsGTExpanded] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [currentFiles, setCurrentFiles] = useState(initialDummyDocuments);
  const [currentImages, setCurrentImages] = useState(initialDummyImages);
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [showSynonymsDialog, setShowSynonymsDialog] = useState(false);
  const [currentSynonyms, setCurrentSynonyms] = useState(initialDummySynonyms);
  const [temperature, setTemperature] = useState(0.5);
  const [topK, setTopK] = useState(250);
  const [topP, setTopP] = useState(0.5);
  const [maxLength, setMaxLength] = useState(2048);

  const selectedSubSectionValue =
    currentSubSections[activeSubSectionIndex]?.value || null;

  // Fetch accidentCases and sectionContents data
  useEffect(() => {
    setLoading(true);
    // Fetch accidentCases
    client
      .service("accidentCases")
      .get(singleAccidentCasesId, {
        query: { $populate: ["createdBy", "updatedBy"] },
      })
      .then((accidentCase) => {
        setSummonsNo(accidentCase.summonsNo || "");
        // Fetch sectionContents for Background and Facts
        return client.service("sectionContents").find({
          query: {
            summonsNo: singleAccidentCasesId,
            section: "Background and Facts",
            $populate: ["createdBy", "updatedBy"],
          },
        });
      })
      .then((sectionContentsRes) => {
        const sectionContents = sectionContentsRes.data || [];
        // Build sectionContent object
        const content = {
          "Background and Facts": {},
        };
        const subSections = sectionContents.map((sc, index) => ({
          label: sc.subsection || `Subsection ${index + 1}`,
          value: sc.subsection || `subsection_${index + 1}`,
        }));
        sectionContents.forEach((sc) => {
          content["Background and Facts"][
            sc.subsection || `subsection_${sc._id}`
          ] = {
            _id: sc._id,
            initialInference: sc.initialInference || "",
            groundTruth: sc.groundTruth || "",
            promptUsed: sc.promptUsed || "",
            retrievedFrom: sc.retrievedFrom || "",
            confusionMatrix: sc.confusionMatrix || null,
          };
        });
        setSectionContent(content);
        // Set opinionSections
        setOpinionSections([
          {
            label: "Background and Facts",
            value: "Background and Facts",
            subSections,
          },
        ]);
        setCurrentSubSections(subSections);
        setLoading(false);
      })
      .catch((error) => {
        console.error({ error });
        setError(error.message || "Failed to fetch data");
        alert({
          title: "Data Fetch Error",
          type: "error",
          message:
            error.message ||
            "Failed to fetch accident case or section contents",
        });
        setLoading(false);
      });
  }, [singleAccidentCasesId, alert]);

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

  const generateConfusionExplanation = (matrix) => {
    if (!matrix) return "";
    let e = [];
    if (matrix.TP !== undefined) e.push(`TP(${matrix.TP}): Correctly present.`);
    if (matrix.FN !== undefined) e.push(`FN(${matrix.FN}): Missing in Infer.`);
    if (matrix.FP !== undefined) e.push(`FP(${matrix.FP}): Extra in Infer.`);
    if (matrix.TN !== undefined) e.push(`TN(${matrix.TN}): Correctly absent.`);
    return e.join(" ");
  };

  const loadContent = useCallback(() => {
    setError("");
    setIsInferExpanded(false);
    setIsGTExpanded(false);
    const sectionData = sectionContent[selectedSection];
    let content = null;
    if (sectionData && currentSubSections.length > 0) {
      const subSectionValue = currentSubSections[activeSubSectionIndex]?.value;
      content = sectionData[subSectionValue];
    }
    const matrix = content?.confusionMatrix || null;
    const explanation = matrix ? generateConfusionExplanation(matrix) : "";
    setInitialInference(content?.initialInference || "");
    setGroundTruth(content?.groundTruth || "");
    setEditableGroundTruth(content?.groundTruth || "");
    setCurrentSectionContentId(content?._id || null);
    setUserPrompt(content?.promptUsed || "");
    setRetrievedFromText(content?.retrievedFrom || "");
    setConfusionMatrixData(matrix);
    setConfusionMatrixExplanation(explanation);
    setIsEditingGroundTruth(false);
  }, [
    selectedSection,
    activeSubSectionIndex,
    currentSubSections,
    sectionContent,
  ]);

  const handlePromptSubmit = () => {
    if (!selectedSection || !userPrompt) {
      setError("Select section and enter prompt.");
      return;
    }
    setLoading(true);
    setError("");
    setInitialInference("");
    setIsInferExpanded(false);
    setIsGTExpanded(false);
    setTimeout(() => {
      const sectionLabel = selectedSection;
      const subSectionLabel =
        currentSubSections[activeSubSectionIndex]?.label || "N/A";
      const dummyResponse = `Simulated response for "${userPrompt}"\nSection: ${sectionLabel}${subSectionLabel !== "N/A" ? " / " + subSectionLabel : ""}.\n\n[cite: simulation]`;
      setInitialInference(dummyResponse);
      setUserPrompt(userPrompt);
      setLoading(false);
      setGroundTruth("");
      setEditableGroundTruth("");
      setRetrievedFromText("Retrieved from simulation.");
      const simMatrix = {
        TP: Math.floor(Math.random() * 5),
        FN: Math.floor(Math.random() * 2),
        FP: Math.floor(Math.random() * 2),
        TN: Math.floor(Math.random() * 3),
      };
      setConfusionMatrixData(simMatrix);
      setConfusionMatrixExplanation(generateConfusionExplanation(simMatrix));
      setCurrentSectionContentId(null);
    }, 1500);
  };

  const handleGroundTruthSave = () => {
    setLoading(true);
    setError("");
    client
      .service("sectionContents")
      .patch(currentSectionContentId, { groundTruth: editableGroundTruth })
      .then(() => {
        setGroundTruth(editableGroundTruth);
        setIsEditingGroundTruth(false);
        setLoading(false);
        const savedMatrix = {
          TP: Math.floor(Math.random() * 5) + 1,
          FN: 0,
          FP: 0,
          TN: Math.floor(Math.random() * 2) + 1,
        };
        setConfusionMatrixData(savedMatrix);
        setConfusionMatrixExplanation(
          generateConfusionExplanation(savedMatrix),
        );
        alert({
          title: "Success",
          type: "success",
          message: "Ground truth updated successfully",
        });
      })
      .catch((error) => {
        setError(error.message || "Failed to save ground truth");
        setLoading(false);
        alert({
          title: "Save Error",
          type: "error",
          message: error.message || "Failed to save ground truth",
        });
      });
  };

  useEffect(() => {
    const sectionData = opinionSections.find(
      (s) => s.value === selectedSection,
    );
    setCurrentSubSections(sectionData?.subSections || []);
    setActiveSubSectionIndex(0);
  }, [selectedSection, opinionSections]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const sectionTitle =
    opinionSections.find((s) => s.value === selectedSection)?.label ||
    "No Section";
  const subSectionTitle =
    currentSubSections[activeSubSectionIndex]?.label || "";
  const renderConfusionMatrix = (matrix) => {
    if (!matrix)
      return <p className="p-text-italic p-text-center p-m-0">N/A</p>;
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
  const panelHeaderTemplate = (title, isExpanded, expandToggler) => {
    return (
      <div className="panel-header-custom">
        <span>{title}</span>
        <Button
          icon={isExpanded ? "pi pi-window-minimize" : "pi pi-window-maximize"}
          className="p-button-text p-button-sm p-button-secondary"
          tooltip={isExpanded ? "Collapse" : "Expand"}
          tooltipOptions={{ position: "top" }}
          onClick={(e) => {
            e.preventDefault();
            expandToggler((prev) => !prev);
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-m-2 p-p-0 page-container themed-container">
      <div className="page-header themed-header">
        <div className="p-d-flex p-ai-center">
          <h4 className="p-m-0 page-title">
            {sectionTitle}
            {subSectionTitle ? ` - ${subSectionTitle}` : ""} (Case:{" "}
            {summonsNo || "Loading..."})
          </h4>
        </div>
        <div className="header-actions">
          <Button
            label="Files"
            icon="pi pi-file"
            className="p-button-text themed-header-button p-mr-2"
            onClick={openFilesDialog}
          />
          <Button
            label="Parameters"
            icon="pi pi-cog"
            className="p-button-text themed-header-button p-mr-2"
            onClick={openParamsDialog}
          />
          <Button
            label="Synonyms"
            icon="pi pi-book"
            className="p-button-text themed-header-button"
            onClick={openSynonymsDialog}
          />
        </div>
      </div>

      <div className="p-m-3 main-content">
        {loading && (
          <div className="p-text-center">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        )}
        {!loading && error && <p className="p-error">{error}</p>}
        {!loading && !error && currentSubSections.length > 0 && (
          <TabView
            activeIndex={activeSubSectionIndex}
            onTabChange={(e) => setActiveSubSectionIndex(e.index)}
            className="p-mb-3 subsection-tabview themed-tabs"
          >
            {currentSubSections.map((sub) => (
              <TabPanel
                key={sub.value}
                header={sub.label}
                disabled={loading}
              ></TabPanel>
            ))}
          </TabView>
        )}

        {!loading && !error && (
          <Panel
            header="Prompt Input"
            toggleable
            collapsed={false}
            className="p-mb-3 prompt-panel shadow-1 themed-panel"
          >
            <div className="p-fluid">
              <InputTextarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                placeholder="Type your prompt here..."
                className="w-full p-mb-2 prompt-textarea"
                disabled={loading || !selectedSection}
                autoResize
              />
              <div className="p-d-flex p-jc-end p-ai-center">
                {loading && (
                  <ProgressSpinner
                    style={{
                      width: "25px",
                      height: "25px",
                      marginRight: "10px",
                    }}
                    strokeWidth="6"
                  />
                )}
                {error && !loading && (
                  <span className="p-error p-mr-2">{error}</span>
                )}
                <Button
                  label="Clear"
                  icon="pi pi-times"
                  className="p-button-text p-button-secondary p-button-sm p-mr-2"
                  onClick={() => {
                    setUserPrompt("");
                    setError("");
                  }}
                  disabled={loading}
                />
                <Button
                  label="Prompt"
                  icon="pi pi-send"
                  onClick={handlePromptSubmit}
                  disabled={!selectedSection || !userPrompt || loading}
                  loading={loading}
                  className="p-button-sm themed-button-prime"
                />
              </div>
            </div>
          </Panel>
        )}

        {!loading && !error && (
          <div className="p-grid results-grid">
            <div className="p-col-12 p-md-6 results-column">
              <Panel
                headerTemplate={() =>
                  panelHeaderTemplate(
                    "Infer Statement",
                    isInferExpanded,
                    setIsInferExpanded,
                  )
                }
                className="h-full shadow-1 themed-panel"
              >
                <Tooltip target=".results-column .pi-window-maximize" />
                <Tooltip target=".results-column .pi-window-minimize" />
                <div
                  className={`content-box ${isInferExpanded ? "expanded" : ""}`}
                >
                  {loading && !initialInference ? (
                    <div className="p-text-center">
                      <ProgressSpinner
                        style={{ width: "30px", height: "30px" }}
                        strokeWidth="6"
                      />
                    </div>
                  ) : (
                    initialInference || "(AI response...)"
                  )}
                </div>
              </Panel>
            </div>
            <div className="p-col-12 p-md-6 results-column">
              <Panel
                headerTemplate={() =>
                  panelHeaderTemplate(
                    "Ground Truth",
                    isGTExpanded,
                    setIsGTExpanded,
                  )
                }
                className="h-full shadow-1 themed-panel"
              >
                <Tooltip target=".results-column .pi-window-maximize" />
                <Tooltip target=".results-column .pi-window-minimize" />
                {isEditingGroundTruth ? (
                  <>
                    <InputTextarea
                      value={editableGroundTruth}
                      onChange={(e) => setEditableGroundTruth(e.target.value)}
                      rows={10}
                      className={`w-full content-box-editing ${isGTExpanded ? "expanded" : ""}`}
                      autoResize
                      disabled={loading}
                    />
                    <div className="p-mt-2 p-d-flex p-jc-end">
                      <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-text p-button-secondary p-mr-2 p-button-sm"
                        onClick={() => {
                          setIsEditingGroundTruth(false);
                          setEditableGroundTruth(groundTruth);
                        }}
                        disabled={loading}
                      />
                      <Button
                        label="Save Ground Truth"
                        icon="pi pi-check"
                        onClick={handleGroundTruthSave}
                        disabled={loading || !currentSectionContentId}
                        loading={loading}
                        className="p-button-sm p-button-success themed-button-success"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`content-box ${isGTExpanded ? "expanded" : ""}`}
                    >
                      {groundTruth || "(Final text...)"}
                    </div>
                    <div className="p-mt-2 p-d-flex p-jc-end">
                      <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        className="p-button-text themed-button-edit p-button-sm"
                        onClick={() => setIsEditingGroundTruth(true)}
                        disabled={loading || !currentSectionContentId}
                      />
                    </div>
                  </>
                )}
              </Panel>
            </div>
          </div>
        )}

        {!loading && !error && (
          <Panel
            header="Retrieved from"
            toggleable
            collapsed={!retrievedFromText}
            className="p-mt-3 retrieved-panel shadow-1 themed-panel-muted"
          >
            <div className="retrieved-content-box">
              {retrievedFromText || "(Source context...)"}
            </div>
          </Panel>
        )}
        {!loading && !error && (
          <Panel
            header="Confusion Matrix Analysis"
            toggleable
            collapsed={!confusionMatrixData}
            className="p-mt-3 confusion-panel shadow-1 themed-panel-muted"
          >
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
          </Panel>
        )}
        {!loading && !error && (
          <Panel
            header="Conclusion"
            toggleable
            collapsed={true}
            className="p-mt-3 conclusion-panel shadow-1 themed-panel-muted"
          >
            <p className="p-text-italic">
              This shows that the GROUNDTRUTH (LEGAL OPINION) is mostly accurate
              but may omit some details.
            </p>
          </Panel>
        )}
      </div>
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
        onSave={handleSynonymsSave}
      />
    </div>
  );
};

export default BackgroundFacts;
