// src/pages/CaseInteractionUIDummy_Themed.js

import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import { Tooltip } from "primereact/tooltip";
// Assuming ProjectLayout provides general page structure (optional)
import ProjectLayout from "../../Layouts/ProjectLayout";

// --- Dummy Data Definitions ---
const dummyCaseNo = "BF-A73KJ-1-01/2023";
const dummySectionContent = {
  "B. Background Facts": {
    "Police Reports": {
      _id: "sc1",
      initialInference:
        "In his police report, the driver stated that on 25.11.2021 around 4.00 a.m...",
      groundTruth:
        "Based on the police report lodged by the driver (Mohd Safuan Bin Mat Isa), on 25.11.2021...",
      promptUsed: "Summarize the first police report...",
      retrievedFrom: `Retrieved from Police Report - Page 3\n\nPADA 25/11/2021 JAM LEBIH KURANG 0610 HRS...`,
      confusionMatrix: { TP: 11, FN: 0, FP: 1, TN: 1 },
    },
    "Sketch Plans": {
      _id: "sc2",
      initialInference: "The sketch plan depicts...",
      groundTruth: "The sketch plan illustrates...",
      promptUsed: "Describe the sketch plan.",
      retrievedFrom: "Retrieved from Sketch Plan Document...",
      confusionMatrix: { TP: 2, FN: 1, FP: 0, TN: 0 },
    },
    "Police Findings": {
      _id: "sc3",
      initialInference: "Driver summoned.",
      groundTruth: "Police findings dated 7.2.2022 confirm...",
      promptUsed: "What were the police findings?",
      retrievedFrom: "Retrieved from Police Findings.",
      confusionMatrix: { TP: 1, FN: 0, FP: 0, TN: 0 },
    },
    "Police Photographs": {
      _id: "sc4",
      initialInference: "Shows lorry parked...",
      groundTruth: "8 photographs provided...",
      promptUsed: "Describe police photos.",
      retrievedFrom: "Retrieved from Legal Opinion - Section B.",
      confusionMatrix: { TP: 2, FN: 0, FP: 0, TN: 0 },
    },
    "Adjuster's Report": {
      _id: "sc5",
      initialInference: "Adjuster interviewed driver...",
      groundTruth: "Adjuster's report dated 25.3.2022 details...",
      promptUsed: "Summarize Adjuster's Report.",
      retrievedFrom: "Retrieved from Adjuster's Report...",
      confusionMatrix: { TP: 3, FN: 0, FP: 0, TN: 0 },
    },
  },
  "C. Liability": {
    _id: "sc6",
    initialInference: "Liability rests with the First Defendant.",
    groundTruth: "Opinion on Liability: Accident caused...",
    promptUsed: "Assess liability.",
    retrievedFrom: "Retrieved from Legal Opinion - Section C",
    confusionMatrix: { TP: 1, FN: 0, FP: 0, TN: 0 },
  },
  "D. Liability Fraud": {
    _id: "sc7",
    initialInference: "No fraud found.",
    groundTruth: "After perusing the documents...",
    promptUsed: "Check for fraud.",
    retrievedFrom: "Retrieved from Legal Opinion - Section D",
    confusionMatrix: { TP: 0, FN: 0, FP: 0, TN: 1 },
  },
  "E. Quantum": {
    _id: "sc8",
    initialInference: "General Damages estimated...",
    groundTruth: "General Damages assessed based on medical reports...",
    promptUsed: "Summarize Quantum assessment.",
    retrievedFrom: "Retrieved from Legal Opinion - Section E",
    confusionMatrix: { TP: 2, FN: 2, FP: 0, TN: 0 },
  },
  "F. Strategy": {
    _id: "sc9",
    initialInference: "Attempt settlement.",
    groundTruth: "We are of the view... attempt to settle...",
    promptUsed: "What is the strategy?",
    retrievedFrom: "Retrieved from Legal Opinion - Section F",
    confusionMatrix: { TP: 1, FN: 0, FP: 0, TN: 0 },
  },
  "G. Conclusion": {
    _id: "sc10",
    initialInference: "Total damages estimated...",
    groundTruth:
      "Damages (on 100% basis) will therefore total: ... = TOTAL RM 47,565.66.",
    promptUsed: "Provide final conclusion.",
    retrievedFrom: "Retrieved from Legal Opinion - Section G",
    confusionMatrix: { TP: 1, FN: 4, FP: 0, TN: 0 },
  },
};
const opinionSections = [
  {
    label: "B. Background Facts",
    value: "B. Background Facts",
    subSections: [
      { label: "1 Police Reports", value: "Police Reports" },
      { label: "2 Sketch Plans", value: "Sketch Plans" },
      { label: "3 Police Findings", value: "Police Findings" },
      { label: "4 Police Photographs", value: "Police Photographs" },
      { label: "5 Adjuster's Report", value: "Adjuster's Report" },
    ],
  },
  { label: "C. Liability", value: "C. Liability", subSections: [] },
  { label: "D. Liability Fraud", value: "D. Liability Fraud", subSections: [] },
  { label: "E. Quantum", value: "E. Quantum", subSections: [] },
  { label: "F. Strategy", value: "F. Strategy", subSections: [] },
  { label: "G. Conclusion", value: "G. Conclusion", subSections: [] },
];

// --- Component Definition ---
const CaseInteractionUIDummy_Themed = (props) => {
  // --- State Variables --- (Same as previous)
  const [selectedSection, setSelectedSection] = useState(
    opinionSections[0].value,
  );
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(0);
  const [currentSubSections, setCurrentSubSections] = useState(
    opinionSections[0].subSections || [],
  );
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
  const selectedSubSectionValue =
    currentSubSections[activeSubSectionIndex]?.value || null;

  // --- Functions --- (Same simulation logic as previous)
  const generateConfusionExplanation = (matrix) => {
    if (!matrix) return "";
    let e = [];
    if (matrix.TP !== undefined) e.push(`TP(${matrix.TP}): Correctly present.`);
    if (matrix.FN !== undefined) e.push(`FN(${matrix.FN}): Missing in Infer.`);
    if (matrix.FP !== undefined) e.push(`FP(${matrix.FP}): Extra in Infer.`);
    if (matrix.TN !== undefined) e.push(`TN(${matrix.TN}): Correctly absent.`);
    return e.join(" ");
  };
  const loadDummyContent = useCallback(() => {
    setError("");
    setIsInferExpanded(false);
    setIsGTExpanded(false);
    const sectionData = dummySectionContent[selectedSection];
    let content = null;
    if (sectionData) {
      if (currentSubSections.length > 0) {
        const subSectionValue =
          currentSubSections[activeSubSectionIndex]?.value;
        content = sectionData[subSectionValue];
      } else {
        content = sectionData;
      }
    }
    const matrix = content?.confusionMatrix || null;
    const explanation = matrix
      ? generateConfusionExplanation(matrix)
      : content?.confusionExplanation || "";
    setInitialInference(content?.initialInference || "");
    setGroundTruth(content?.groundTruth || "");
    setEditableGroundTruth(content?.groundTruth || "");
    setCurrentSectionContentId(content?._id || null);
    setUserPrompt(content?.promptUsed || "");
    setRetrievedFromText(content?.retrievedFrom || "");
    setConfusionMatrixData(matrix);
    setConfusionMatrixExplanation(explanation);
    setIsEditingGroundTruth(false);
  }, [selectedSection, activeSubSectionIndex, currentSubSections]);
  const handleDummyPromptSubmit = () => {
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
      const dummyResponse = `Simulated response for "${userPrompt}"\nSection: ${sectionLabel}${subSectionLabel !== "N/A" ? " / " + subSectionLabel : ""}.\n\n[cite: dummy_1]`;
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
    setTimeout(() => {
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
      setConfusionMatrixExplanation(generateConfusionExplanation(savedMatrix));
    }, 500);
  };

  // --- Effects --- (Same as previous)
  useEffect(() => {
    const sectionData = opinionSections.find(
      (s) => s.value === selectedSection,
    );
    setCurrentSubSections(sectionData?.subSections || []);
    setActiveSubSectionIndex(0);
  }, [selectedSection]);
  useEffect(() => {
    loadDummyContent();
  }, [loadDummyContent]);

  // --- Render Logic ---
  const sectionTitle = selectedSection
    ? opinionSections.find((s) => s.value === selectedSection)?.label
    : "No Section";
  const subSectionTitle =
    currentSubSections[activeSubSectionIndex]?.label || "";
  const renderConfusionMatrix = (matrix) => {
    if (!matrix)
      return <p className="p-text-italic p-text-center p-m-0">N/A</p>;
    return (
      <table className="confusion-matrix-table">
        {" "}
        <thead>
          {" "}
          <tr>
            <th></th>
            <th>Predicted Positive</th>
            <th>Predicted Negative</th>
          </tr>{" "}
        </thead>{" "}
        <tbody>
          {" "}
          <tr>
            <td>
              <b>Actual Positive</b>
            </td>
            <td>{matrix.TP ?? "-"}</td>
            <td>{matrix.FN ?? "-"}</td>
          </tr>{" "}
          <tr>
            <td>
              <b>Actual Negative</b>
            </td>
            <td>{matrix.FP ?? "-"}</td>
            <td>{matrix.TN ?? "-"}</td>
          </tr>{" "}
        </tbody>{" "}
      </table>
    );
  };
  const panelHeaderTemplate = (title, isExpanded, expandToggler) => {
    return (
      <div className="panel-header-custom">
        {" "}
        <span>{title}</span>{" "}
        <Button
          icon={isExpanded ? "pi pi-window-minimize" : "pi pi-window-maximize"}
          className="p-button-text p-button-sm p-button-secondary"
          tooltip={isExpanded ? "Collapse" : "Expand"}
          tooltipOptions={{ position: "top" }}
          onClick={(e) => {
            e.preventDefault();
            expandToggler((prev) => !prev);
          }}
        />{" "}
      </div>
    );
  };

  return (
    <ProjectLayout>
      <div className="p-m-2 p-p-0 page-container themed-container">
        {/* Header */}
        <div className="page-header themed-header">
          <div className="p-d-flex p-ai-center">
            <h4 className="p-m-0 page-title">
              {sectionTitle}
              {subSectionTitle ? ` - ${subSectionTitle}` : ""}
            </h4>
          </div>
          <div className="header-actions">
            <Button
              label="Files"
              icon="pi pi-file"
              className="p-button-text themed-header-button p-mr-2"
            />
            <Button
              label="Parameters"
              icon="pi pi-cog"
              className="p-button-text themed-header-button p-mr-2"
            />
            <Button
              label="Synonyms"
              icon="pi pi-book"
              className="p-button-text themed-header-button"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-m-3 main-content">
          {/* Sub-section Tabs */}
          {currentSubSections.length > 0 && (
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

          {/* Prompt Panel */}
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
                  onClick={handleDummyPromptSubmit}
                  disabled={!selectedSection || !userPrompt || loading}
                  loading={loading}
                  className="p-button-sm themed-button-prime"
                />
              </div>
            </div>
          </Panel>

          {/* Side-by-Side Results Area */}
          <div className="p-grid results-grid">
            <div className="p-col-12 p-md-6 results-column">
              {/* Removed fixed height class */}
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
                <Tooltip target=".results-column .pi-window-maximize" />{" "}
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
              {/* Removed fixed height class */}
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
                <Tooltip target=".results-column .pi-window-maximize" />{" "}
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
                      {/* Success button for save */}
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
                      {" "}
                      {groundTruth || "(Final text...)"}{" "}
                    </div>
                    <div className="p-mt-2 p-d-flex p-jc-end">
                      {/* Info button for edit */}
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

          {/* Other Panels */}
          <Panel
            header="Retrieved from"
            toggleable
            collapsed={!retrievedFromText}
            className="p-mt-3 retrieved-panel shadow-1 themed-panel-muted"
          >
            <div className="retrieved-content-box">
              {" "}
              {retrievedFromText || "(Source context...)"}{" "}
            </div>
          </Panel>
          <Panel
            header="Confusion Matrix Analysis"
            toggleable
            collapsed={!confusionMatrixData}
            className="p-mt-3 confusion-panel shadow-1 themed-panel-muted"
          >
            <div className="p-grid p-ai-start">
              <div className="p-col-12 p-md-4 p-lg-3">
                {" "}
                {renderConfusionMatrix(confusionMatrixData)}{" "}
              </div>
              <div className="p-col-12 p-md-8 p-lg-9">
                {" "}
                <div className="explanation-box">
                  {" "}
                  {confusionMatrixExplanation || "(Explanation...)"}{" "}
                </div>{" "}
              </div>
            </div>
          </Panel>
          <Panel
            header="Conclusion"
            toggleable
            collapsed={true}
            className="p-mt-3 conclusion-panel shadow-1 themed-panel-muted"
          >
            <p className="p-text-italic">(Final conclusion section...)</p>
          </Panel>
        </div>

        {/* Enhanced CSS with Theme */}
        <style jsx global>{`
          /* --- THEME VARIABLES --- */
          :root {
            --theme-primary: #511718; /* Dark Reddish-Brown */
            --theme-secondary: #6a3638; /* Very Dark Brown/Black */
            --theme-text-on-dark: #f8f9fa; /* Light text for dark backgrounds */
            --theme-text-on-light: #260b0b; /* Dark text for light backgrounds */
            --theme-background: #f4f5f7; /* Light grey background */
            --theme-panel-bg: #ffffff; /* White panel background */
            --theme-muted-bg: #f8f9fa; /* Slightly off-white for muted panels/areas */
            --theme-border: #d1d5db; /* Light grey border */
            --theme-primary-hover: #401213; /* Darker shade for primary hover */
            --theme-secondary-hover: #1a0707; /* Darker shade for secondary hover */
          }

          /* --- BASE & LAYOUT --- */
          body {
            margin: 0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--theme-background);
            color: var(--theme-text-on-light);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .page-container {
            max-width: 1800px;
            margin: 1rem auto;
            background-color: var(--theme-background);
            padding: 0;
          }
          .main-content {
            padding: 1rem 1.5rem;
          }
          .shadow-1 {
            box-shadow:
              0 1px 3px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.05);
          }

          /* --- HEADER --- */
          .page-header {
            background: var(--theme-panel-bg);
            border-bottom: 1px solid var(--theme-border);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px 8px 0 0;
            margin: 1rem 1rem 0 1rem;
          } /* Added margin */
          .page-title {
            margin: 0;
            color: var(--theme-secondary);
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 1.25rem;
          }
          .header-actions .p-button-text {
            color: var(--theme-secondary);
          }
          .header-actions .p-button-text:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
          .themed-dropdown .p-dropdown {
            border-color: var(--theme-border);
          }
          .themed-dropdown .p-dropdown:not(.p-disabled).p-focus {
            border-color: var(--theme-primary);
          }

          /* --- TABS --- */
          .subsection-tabview {
            margin-bottom: 1.5rem;
          }
          .subsection-tabview .p-tabview-nav {
            border-bottom: 2px solid var(--theme-border);
            background: none;
          }
          .subsection-tabview .p-tabview-nav-link {
            font-size: 0.95rem;
            padding: 0.8rem 1.2rem;
            border: 0 !important;
            border-bottom: 2px solid transparent !important;
            color: var(--theme-secondary);
            font-weight: 500;
            transition:
              background-color 0.2s,
              color 0.2s,
              border-color 0.2s;
            margin-bottom: -2px;
          } /* Overlap border */
          .subsection-tabview .p-tabview-nav-link:not(.p-highlight):hover {
            background-color: var(--theme-muted-bg) !important;
            color: var(--theme-primary);
          }
          .subsection-tabview .p-highlight .p-tabview-nav-link {
            color: var(--theme-primary);
            border-color: var(--theme-primary) !important;
            background: none !important;
            font-weight: 600;
          }

          /* --- PANELS --- */
          .themed-panel .p-panel-header,
          .themed-panel-muted .p-panel-header {
            background: var(--theme-panel-bg);
            border-color: var(--theme-border);
            padding: 0.8rem 1.2rem;
            border-radius: 6px 6px 0 0;
            font-weight: 600;
            color: var(--theme-secondary);
          }
          .themed-panel-muted .p-panel-header {
            background: var(--theme-muted-bg);
          }
          .themed-panel .p-panel-content,
          .themed-panel-muted .p-panel-content {
            padding: 1.2rem;
            border-color: var(--theme-border);
            border-width: 0 1px 1px 1px;
            border-style: solid;
            border-radius: 0 0 6px 6px;
            font-size: 0.9rem;
          }
          .prompt-panel {
            border: 1px solid var(--theme-border);
          }
          .prompt-panel .p-panel-header {
            background: var(--theme-muted-bg);
            font-weight: 600;
            color: var(--theme-secondary);
          }

          /* --- BUTTONS (Theme Applied) --- */
          .p-button.themed-button-prime {
            background: var(--theme-primary);
            border-color: var(--theme-primary);
            color: var(--theme-text-on-dark);
          }
          .p-button.themed-button-prime:enabled:hover {
            background: var(--theme-primary-hover);
            border-color: var(--theme-primary-hover);
          }
          .p-button.p-button-success.themed-button-success {
            background: #166534;
            border-color: #166534;
            color: #fff;
          } /* Example Success */
          .p-button.p-button-success.themed-button-success:enabled:hover {
            background: #14532d;
            border-color: #14532d;
          }
          .p-button.p-button-text.themed-button-edit {
            color: var(--theme-primary);
          }
          .p-button.p-button-text.themed-button-edit:enabled:hover {
            background: rgba(81, 23, 24, 0.1);
          } /* Light primary hover */

          /* --- CONTENT BOXES (Height Adjusted) --- */
          .content-box,
          .content-box-editing {
            font-family: var(--font-family);
            min-height: 150px; /* Reduced min-height */
            max-height: 35vh; /* Reduced max-height */
            white-space: pre-wrap;
            overflow-y: auto;
            padding: 1rem;
            background: var(--theme-panel-bg);
            border: 1px solid var(--theme-border);
            border-radius: 4px;
            font-size: 0.95rem;
            line-height: 1.6;
            transition: max-height 0.4s ease-in-out;
            flex-grow: 1;
            margin-bottom: 10px;
            color: var(--theme-text-on-light);
          }
          .content-box.expanded,
          .content-box-editing.expanded {
            max-height: 75vh; /* Keep expanded height large */
          }

          /* --- OTHER SECTIONS (Themed) --- */
          .retrieved-content-box,
          .explanation-box {
            white-space: pre-wrap;
            font-size: 0.9rem;
            color: var(--theme-text-on-light);
            line-height: 1.5;
            max-height: 180px;
            overflow-y: auto;
            padding: 1rem;
            background: var(--theme-muted-bg);
            border-radius: 4px;
            border: 1px solid var(--theme-border);
          }
          .explanation-box {
            max-height: none;
          }
          .confusion-matrix-table {
            width: 100%;
            max-width: 280px;
            border-collapse: collapse;
            font-size: 0.9rem;
            margin: 0 auto 1rem auto;
            border: 1px solid var(--theme-border);
            border-radius: 4px;
            overflow: hidden;
          } /* Added radius/overflow */
          .confusion-matrix-table th,
          .confusion-matrix-table td {
            border: 1px solid var(--theme-border);
            padding: 8px 12px;
            text-align: center;
          }
          .confusion-matrix-table th {
            background-color: var(--theme-secondary);
            color: var(--theme-text-on-dark);
            font-weight: 600;
            border-color: var(--theme-secondary);
          }
          .confusion-matrix-table td {
            background-color: var(--theme-panel-bg);
          }
          .confusion-matrix-table td:first-child {
            text-align: left;
            font-weight: 600;
            background-color: var(--theme-muted-bg);
          }

          /* --- LAYOUT & MISC --- */
          .h-full {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .h-full .p-panel-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          .results-grid > .results-column {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            display: flex;
            flex-direction: column;
          }
          .results-grid > .results-column > .p-panel {
            flex-grow: 1;
          }
          .results-grid {
            margin-left: -0.75rem;
            margin-right: -0.75rem;
            display: flex;
            flex-wrap: wrap;
          } /* Ensure flex wrap */
          @media (min-width: 768px) {
            .results-grid > .p-md-6 {
              width: 50% !important;
              flex: 0 0 50% !important;
              max-width: 50% !important;
            }
          }
          .p-inputtextarea {
            line-height: 1.6;
          }
          .p-panel .panel-header-custom {
            /* Custom header class */
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }
          .p-panel .panel-header-custom > span {
            font-weight: 600;
            color: var(--theme-secondary);
          } /* Style title in header */
          .p-panel .p-panel-header {
            background: var(--theme-muted-bg);
            border-color: var(--theme-border);
            padding: 0.8rem 1.2rem;
          } /* Ensure header bg */
        `}</style>
      </div>
    </ProjectLayout> // Removed ProjectLayout wrapper if not needed here
  );
};

export default CaseInteractionUIDummy_Themed; // Updated component name
