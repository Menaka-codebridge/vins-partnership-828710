import React from "react";
import { Button } from "primereact/button";
import GenerateLegalDocument from "./GenerateLegalDocument";
import "./CaseLayout.styles.css";

const RightSidebar = ({
  visibleRight,
  setVisibleRight,
  allSections,
  expandedGroundTruth,
  toggleGroundTruthExpand,
  accidentCase,
  onOpenFilesDialog,
  onOpenParamsDialog,
  onOpenSynonymsDialog,
  onGenerateLegalDocument,
}) => {
  console.log("RightSidebar props:", { visibleRight, setVisibleRight });

  return (
    <>
      <div className="right-sidebar">
        <div className="sidebar-menu mt-20">
          <Button
            icon="pi pi-file"
            className="p-button-text sidebar-menu-item"
            onClick={onOpenFilesDialog}
            tooltip="Files"
            tooltipOptions={{ position: "left" }}
          />
          <Button
            icon="pi pi-cog"
            className="p-button-text sidebar-menu-item"
            onClick={onOpenParamsDialog}
            tooltip="Parameters"
            tooltipOptions={{ position: "left" }}
          />
          <Button
            icon="pi pi-book"
            className="p-button-text sidebar-menu-item"
            onClick={onOpenSynonymsDialog}
            tooltip="Synonyms"
            tooltipOptions={{ position: "left" }}
          />
          <Button
            icon="pi pi-file-pdf"
            className="p-button-text sidebar-menu-item"
            onClick={() => {
              console.log(
                "Generate PDF Legal Document button clicked, setting visibleRight to true",
              );
              setVisibleRight(true);
            }}
            tooltip="Generate PDF Document"
            tooltipOptions={{ position: "left" }}
          />
          {/* <Button
            icon="pi pi-file-word"
            className="p-button-text sidebar-menu-item"
            onClick={() => {
              console.log("Generate Word Legal Document button clicked, setting visibleRight to true");
              setVisibleRight(true);
            }}
            tooltip="Generate Word Document"
            tooltipOptions={{ position: "left" }}
          /> */}
        </div>
      </div>

      <GenerateLegalDocument
        visibleRight={visibleRight}
        setVisibleRight={setVisibleRight}
        allSections={allSections}
        expandedGroundTruth={expandedGroundTruth}
        toggleGroundTruthExpand={toggleGroundTruthExpand}
        accidentCase={accidentCase}
      />
    </>
  );
};

export default RightSidebar;
