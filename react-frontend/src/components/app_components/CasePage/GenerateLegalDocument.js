import React, { useRef, useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import * as docx from "docx";
import mammoth from "mammoth";
import LegalDocument from "./LegalDocument";
import LegalDocumentWord from "./LegalDocumentWord";
import "./CaseLayout.styles.css";
import PropTypes from "prop-types";

const GenerateLegalDocument = ({
  visibleRight,
  setVisibleRight,
  allSections,
  expandedGroundTruth,
  toggleGroundTruthExpand,
  accidentCase,
  onNavigateToSubSection, // New prop
}) => {
  console.log("GenerateLegalDocument props:", {
    visibleRight,
    allSections,
    accidentCase,
  });

  const downloadLinkRef = useRef(null);
  const [localSections, setLocalSections] = useState([]);
  const [removedGroundTruths, setRemovedGroundTruths] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [format, setFormat] = useState(null); // "pdf" or "word"
  const [wordPreviewHtml, setWordPreviewHtml] = useState("");

  // Function to remove superscripts from text
  const removeSuperscripts = (text) => {
    if (!text || typeof text !== "string") return text;
    return text.replace(/[\u2070-\u2079\u00B2\u00B3\u00B9]/g, "");
  };

  useEffect(() => {
    const filteredSections = allSections
      .filter((section) => section.value !== "Confusion Matrix")
      .map((section) => ({
        ...section,
        subSections: section.subSections.map((subSection) => ({
          ...subSection,
          groundTruth: removeSuperscripts(subSection.groundTruth),
        })),
      }));
    setLocalSections(filteredSections);
  }, [allSections]);

  useEffect(() => {
    if (showPreview && format === "word") {
      const doc = LegalDocumentWord({
        accidentCase,
        allSections: localSections,
      });
      docx.Packer.toBlob(doc).then((blob) => {
        blob.arrayBuffer().then((arrayBuffer) => {
          mammoth
            .convertToHtml({ arrayBuffer })
            .then((result) => {
              setWordPreviewHtml(result.value);
            })
            .catch((err) => {
              console.error("Error converting Word to HTML:", err);
              setWordPreviewHtml(
                "<p>Error generating preview. Please download to view the content.</p>",
              );
            });
        });
      });
    }
  }, [showPreview, format, accidentCase, localSections]);

  const handleRemoveGroundTruth = (
    sectionValue,
    subSectionValue,
    groundTruth,
  ) => {
    setRemovedGroundTruths((prev) => ({
      ...prev,
      [subSectionValue]: groundTruth || "",
    }));
    setLocalSections((prevSections) =>
      prevSections.map((section) =>
        section.value === sectionValue
          ? {
              ...section,
              subSections: section.subSections.map((subSection) =>
                subSection.value === subSectionValue
                  ? { ...subSection, groundTruth: "" }
                  : subSection,
              ),
            }
          : section,
      ),
    );
  };

  const handleAddGroundTruth = (sectionValue, subSectionValue) => {
    if (onNavigateToSubSection) {
      onNavigateToSubSection(sectionValue, subSectionValue);
    } else {
      console.warn("onNavigateToSubSection is not provided");
    }
  };

  const handleWordDownload = () => {
    const doc = LegalDocumentWord({ accidentCase, allSections: localSections });
    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Legal_Opinion.docx");
    });
  };

  const handlePreview = (formatType) => {
    setFormat(formatType);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setFormat(null);
    setWordPreviewHtml("");
  };

  return (
    <>
      <Sidebar
        visible={visibleRight}
        position="right"
        onHide={() => {
          console.log("Sidebar onHide called, setting visibleRight to false");
          setVisibleRight(false);
        }}
        className="case-sidebar"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "80px" }}>
          <div className="sidebar-content">
            {localSections.map((section) => (
              <div key={section.value} className="sidebar-section">
                {section.subSections.map((subSection, index) => (
                  <div key={subSection.value} className="sidebar-subsection">
                    <h4 className="sidebar-section-header">
                      {index === 0 ? section.label + " " : ""}
                      {subSection.label}
                    </h4>
                    <div className="sidebar-subsection-content">
                      <h5 className="sidebar-subsection-title">Prompt:</h5>
                      <p className="sidebar-subsection-text sidebar-prompt-text">
                        {subSection.promptUsed || "No prompt available."}
                      </p>
                      <h5 className="sidebar-subsection-title">
                        Ground Truth:
                      </h5>
                      {subSection.groundTruth ? (
                        <>
                          {subSection.groundTruth.length > 100 ? (
                            expandedGroundTruth[subSection.value] ? (
                              <>
                                <p className="sidebar-subsection-text">
                                  {subSection.groundTruth}
                                </p>
                                <Button
                                  label="See Less"
                                  className="p-button-text p-button-sm sidebar-see-more"
                                  onClick={() =>
                                    toggleGroundTruthExpand(subSection.value)
                                  }
                                />
                              </>
                            ) : (
                              <>
                                <p className="sidebar-subsection-text">
                                  {subSection.groundTruth.substring(0, 100) +
                                    "..."}
                                </p>
                                <Button
                                  label="See More"
                                  className="p-button-text p-button-sm sidebar-see-more"
                                  onClick={() =>
                                    toggleGroundTruthExpand(subSection.value)
                                  }
                                />
                              </>
                            )
                          ) : (
                            <p className="sidebar-subsection-text">
                              {subSection.groundTruth}
                            </p>
                          )}
                          <Button
                            icon="pi pi-trash"
                            className="p-button-text p-button-sm p-button-danger"
                            tooltip="Remove Ground Truth"
                            tooltipOptions={{ position: "top" }}
                            onClick={() =>
                              handleRemoveGroundTruth(
                                section.value,
                                subSection.value,
                                subSection.groundTruth,
                              )
                            }
                            style={{ marginTop: "0.5rem" }}
                          />
                        </>
                      ) : (
                        <div
                          className="empty-ground-truth-box"
                          onClick={() =>
                            handleAddGroundTruth(
                              section.value,
                              subSection.value,
                            )
                          }
                        >
                          <i
                            className="pi pi-plus plus-icon"
                            style={{ fontSize: "1.5rem" }}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {localSections.length === 0 && (
              <p className="p-text-center">No sections available.</p>
            )}
          </div>
        </div>
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid #dee2e6",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 5,
            bottom: -20,
            left: 0,
            right: 0,
            display: "flex",
            gap: "1rem",
          }}
        >
          <Button
            label="Preview PDF"
            icon="pi pi-file-pdf"
            className="p-button-primary w-full mt-13"
            disabled={!accidentCase}
            onClick={() => handlePreview("pdf")}
          />
          <Button
            label="Preview Word"
            icon="pi pi-file-word"
            className="p-button-primary w-full mt-13"
            disabled={!accidentCase}
            onClick={() => handlePreview("word")}
          />
        </div>
      </Sidebar>

      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#fff",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
            {format === "pdf" && (
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                <LegalDocument
                  accidentCase={accidentCase}
                  allSections={localSections}
                />
              </PDFViewer>
            )}
            {format === "word" && (
              <div
                className="word-preview-container"
                style={{
                  backgroundColor: "#fff",
                  padding: "2rem",
                  border: "1px solid #dee2e6",
                  height: "100%",
                  overflowY: "auto",
                  fontFamily: '"Times New Roman", serif',
                  fontSize: "12pt",
                  lineHeight: "1.6",
                  maxWidth: "8.5in",
                  margin: "0 auto",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                dangerouslySetInnerHTML={{
                  __html: wordPreviewHtml || "<p>Loading Word preview...</p>",
                }}
              />
            )}
          </div>
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid #dee2e6",
              backgroundColor: "#ffffff",
              position: "sticky",
              bottom: 0,
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            {format === "pdf" && (
              <PDFDownloadLink
                document={
                  <LegalDocument
                    accidentCase={accidentCase}
                    allSections={localSections}
                  />
                }
                fileName="Legal_Opinion.pdf"
                style={{ textDecoration: "none", flex: 1, maxWidth: "200px" }}
              >
                {({ blob, url, loading, error }) => (
                  <Button
                    label={loading ? "Generating PDF..." : "Download PDF"}
                    icon="pi pi-file-pdf"
                    className="p-button-primary w-full"
                    disabled={loading || !accidentCase}
                    onClick={() =>
                      console.log("PDFDownloadLink:", { blob, url, error })
                    }
                  />
                )}
              </PDFDownloadLink>
            )}
            {format === "word" && (
              <Button
                label="Download Word"
                icon="pi pi-file-word"
                className="p-button-primary w-full"
                style={{ maxWidth: "200px" }}
                disabled={!accidentCase}
                onClick={handleWordDownload}
              />
            )}
            <Button
              label="Close Preview"
              icon="pi pi-times"
              className="p-button-secondary w-full"
              style={{ maxWidth: "200px" }}
              onClick={handleClosePreview}
            />
          </div>
        </div>
      )}
    </>
  );
};

GenerateLegalDocument.propTypes = {
  visibleRight: PropTypes.bool.isRequired,
  setVisibleRight: PropTypes.func.isRequired,
  allSections: PropTypes.array.isRequired,
  expandedGroundTruth: PropTypes.object.isRequired,
  toggleGroundTruthExpand: PropTypes.func.isRequired,
  accidentCase: PropTypes.object,
  onNavigateToSubSection: PropTypes.func, // Add prop type
};

GenerateLegalDocument.defaultProps = {
  accidentCase: null,
  onNavigateToSubSection: undefined,
};

export default GenerateLegalDocument;