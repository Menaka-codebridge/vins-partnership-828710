import React, { useState } from "react";
import CaseInferencePageLayout from "./CaseInferencePageLayout";
import LeftSidebar from "./LeftSidebar";
import "./CaseLayout.styles.css";

const CaseLayout = (props) => {
  const [activeSection, setActiveSection] = useState("Background Facts");
  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState(0);
  const [allSections, setAllSections] = useState([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [visibleRight, setVisibleRight] = useState(false);

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
