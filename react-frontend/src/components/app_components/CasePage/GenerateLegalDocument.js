import React, { useRef, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import * as docx from "docx";
import LegalDocument from "./LegalDocument";
import LegalDocumentWord from "./LegalDocumentWord";
import "./CaseLayout.styles.css";

const GenerateLegalDocument = ({
  visibleRight,
  setVisibleRight,
  allSections,
  expandedGroundTruth,
  toggleGroundTruthExpand,
  accidentCase,
}) => {
  console.log("GenerateLegalDocument props:", {
    visibleRight,
    allSections,
    accidentCase,
  });

  const downloadLinkRef = useRef(null);
  // Filter out "Confusion Matrix" section
  const filteredSections = allSections.filter(
    (section) => section.value !== "Confusion Matrix",
  );
  const [localSections, setLocalSections] = useState(filteredSections);
  const [removedGroundTruths, setRemovedGroundTruths] = useState({});

  React.useEffect(() => {
    setLocalSections(filteredSections);
  }, [allSections]);

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
    const originalGroundTruth = removedGroundTruths[subSectionValue] || "";
    setLocalSections((prevSections) =>
      prevSections.map((section) =>
        section.value === sectionValue
          ? {
              ...section,
              subSections: section.subSections.map((subSection) =>
                subSection.value === subSectionValue
                  ? { ...subSection, groundTruth: originalGroundTruth }
                  : subSection,
              ),
            }
          : section,
      ),
    );
    setRemovedGroundTruths((prev) => {
      const newState = { ...prev };
      delete newState[subSectionValue];
      return newState;
    });
  };

  const handleWordDownload = () => {
    const doc = LegalDocumentWord({ accidentCase, allSections: localSections });
    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Legal_Opinion.docx");
    });
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
          <PDFDownloadLink
            document={
              <LegalDocument
                accidentCase={accidentCase}
                allSections={localSections}
              />
            }
            fileName="Legal_Opinion.pdf"
            style={{ textDecoration: "none", flex: 1 }}
          >
            {({ blob, url, loading, error }) => (
              <Button
                label={loading ? "Generating PDF..." : "Download PDF"}
                icon="pi pi-file-pdf"
                className="p-button-primary w-full mt-13"
                disabled={loading || !accidentCase}
                onClick={() =>
                  console.log("PDFDownloadLink:", { blob, url, error })
                }
              />
            )}
          </PDFDownloadLink>
          <Button
            label="Download Word"
            icon="pi pi-file-word"
            className="p-button-primary w-full mt-13"
            disabled={!accidentCase}
            onClick={handleWordDownload}
          />
        </div>
      </Sidebar>
    </>
  );
};

export default GenerateLegalDocument;
