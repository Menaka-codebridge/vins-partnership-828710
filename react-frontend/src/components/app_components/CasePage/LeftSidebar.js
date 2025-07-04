import React, { useState } from "react";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import Toggle from "../../../assets/icons/Toggle.js";

const LeftSidebar = ({
  activeSection,
  setActiveSection,
  allSections,
  setActiveSubSectionIndex,
  activeSubSectionIndex,
  isShrunk,
  setIsShrunk,
}) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Define the desired order of sections and subsections
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

  // Sort sections according to the defined order
  const sortedSections = [...allSections].sort((a, b) => {
    const indexA = SECTION_ORDER.indexOf(a.value);
    const indexB = SECTION_ORDER.indexOf(b.value);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Sort subsections for each section
  const processedSections = sortedSections.map((section) => {
    if (SUBSECTION_ORDER[section.value]) {
      const orderedSubsections = [];
      const unorderedSubsections = [...section.subSections];

      // Add subsections in the defined order if they exist
      SUBSECTION_ORDER[section.value].forEach((subName) => {
        const index = unorderedSubsections.findIndex(
          (sub) => sub.label === subName,
        );
        if (index !== -1) {
          orderedSubsections.push(unorderedSubsections[index]);
          unorderedSubsections.splice(index, 1);
        }
      });

      // Add any remaining subsections that weren't in the predefined order
      return {
        ...section,
        subSections: [...orderedSubsections, ...unorderedSubsections],
      };
    }
    return section;
  });

  const toggleSection = (sectionValue) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionValue]: !prev[sectionValue],
    }));
  };

  const handleSectionClick = (sectionValue) => {
    setActiveSection(sectionValue);
    setActiveSubSectionIndex(0); // Reset to first subsection
  };

  const handleSubSectionClick = (sectionValue, subSectionIndex) => {
    setActiveSection(sectionValue);
    setActiveSubSectionIndex(subSectionIndex);
  };

  // Get initials of a label (first letter of significant words)
  const getInitial = (label) => {
    if (!label) return "";
    const ignoreWords = ["and", "or", "of", "the", "in", "to"];
    return label
      .split(" ")
      .filter((word) => !ignoreWords.includes(word.toLowerCase()))
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <motion.div
      className="left-sidebar mt-10"
      animate={{ width: isShrunk ? 60 : 250 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sidebar-header mt-10">
        <div className="flex gap-3 px-3 py-[10px]">
          <span
            className="cursor-pointer"
            onClick={() => setIsShrunk(!isShrunk)}
          >
            <Toggle />
          </span>
        </div>
      </div>
      <div className="sidebar-menu ">
        {processedSections.map((section) => (
          <div key={section.value} className="sidebar-section">
            <Button
              label={isShrunk ? getInitial(section.label) : section.label}
              icon={
                expandedSections[section.value]
                  ? "pi pi-chevron-down"
                  : "pi pi-chevron-right"
              }
              className={`sidebar-menu-item ${activeSection === section.value ? "active" : ""}`}
              onClick={() => {
                handleSectionClick(section.value);
                toggleSection(section.value);
              }}
              style={{
                width: "100%",
                justifyContent: isShrunk ? "center" : "flex-start",
              }}
              tooltip={isShrunk ? section.label : undefined}
              tooltipOptions={{ position: "right" }}
            />
            {expandedSections[section.value] &&
              section.subSections.length > 0 && (
                <motion.div
                  className="sidebar-submenu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {section.subSections.map((subSection, index) => (
                    <Button
                      key={subSection.value}
                      label={
                        isShrunk
                          ? getInitial(subSection.label)
                          : subSection.label
                      }
                      className={`sidebar-submenu-item ${
                        activeSection === section.value &&
                        index === activeSubSectionIndex
                          ? "active-sub"
                          : ""
                      }`}
                      onClick={() =>
                        handleSubSectionClick(section.value, index)
                      }
                      style={{
                        width: "100%",
                        justifyContent: isShrunk ? "center" : "flex-start",
                        paddingLeft: isShrunk ? "0.5rem" : "2rem",
                      }}
                      tooltip={isShrunk ? subSection.label : undefined}
                      tooltipOptions={{ position: "right" }}
                    />
                  ))}
                </motion.div>
              )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LeftSidebar;