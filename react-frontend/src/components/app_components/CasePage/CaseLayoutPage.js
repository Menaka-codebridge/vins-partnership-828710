import React, { useState, useEffect } from "react";
import CaseInferencePageLayout from "./CaseInferencePageLayout";
import LeftSidebar from "./LeftSidebar";
import "./CaseLayout.styles.css";

const CaseLayout = (props) => {
  const [activeSection, setActiveSection] = useState("Background and Facts");
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(0);
  const [allSections, setAllSections] = useState([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [visibleRight, setVisibleRight] = useState(false);

  // Navigation callback to set active section and subsection
  const handleNavigateToSubSection = (sectionValue, subSectionValue) => {
    const section = allSections.find((s) => s.value === sectionValue);
    if (section) {
      const subSectionIndex = section.subSections.findIndex(
        (sub) => sub.value === subSectionValue
      );
      if (subSectionIndex !== -1) {
        setActiveSection(sectionValue);
        setActiveSubSectionIndex(subSectionIndex);
        setVisibleRight(false); // Close the right sidebar after navigation
      } else {
        console.warn(`Subsection ${subSectionValue} not found in section ${sectionValue}`);
      }
    } else {
      console.warn(`Section ${sectionValue} not found`);
    }
  };

  useEffect(() => {
    if (
      allSections.length > 0 &&
      !allSections.some((s) => s.value === activeSection)
    ) {
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
          onNavigateToSubSection={handleNavigateToSubSection}
        />
      </div>
    </div>
  );
};

export default CaseLayout;