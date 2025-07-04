import React, { useState, useEffect } from "react";
import CaseInferencePageLayout from "./CaseInferencePageLayout";
import LeftSidebar from "./LeftSidebar";
import "./CaseLayout.styles.css";

const CaseLayout = (props) => {
  // Initialize activeSection to the first section in SECTION_ORDER
  const [activeSection, setActiveSection] = useState("Background and Facts");
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(0);
  const [allSections, setAllSections] = useState([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [visibleRight, setVisibleRight] = useState(false);

  // Ensure activeSection and activeSubSectionIndex are set correctly when allSections is updated
  useEffect(() => {
    if (allSections.length > 0 && !allSections.some(s => s.value === activeSection)) {
      // Set to first section and first subsection if current activeSection is invalid
      setActiveSection("Background and Facts");
      setActiveSubSectionIndex(0);
    }
  }, [allSections]);

  return (
    <div className="case-layout-container">
      <LeftSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        allSections={allSections}
        setActiveSubSectionIndex={setActiveSubSectionIndex}
        activeSubSectionIndex={activeSubSectionIndex}
        isShrunk={isShrunk}
        setIsShrunk={setIsShrunk}
      />
      <div
        className="main-content"
        style={{
          marginLeft: isShrunk ? "60px" : "250px",
          marginRight: "60px",
          paddingTop: "100px",
          transition: "margin-left 0.3s",
        }}
      >
        <CaseInferencePageLayout
          props={{ section: activeSection, activeSubSectionIndex, isShrunk }}
          setAllSections={setAllSections}
          visibleRight={visibleRight}
          setVisibleRight={setVisibleRight}
        />
      </div>
    </div>
  );
};

export default CaseLayout;
