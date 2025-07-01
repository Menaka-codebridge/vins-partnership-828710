import React, { createContext, useContext, useState } from "react";

const LeftSidebarContext = createContext();

const LeftSidebarProvider = ({
  children,
  activeSection,
  setActiveSection,
  activeSubSectionIndex,
  setActiveSubSectionIndex,
}) => {
  const [open, setOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  return (
    <LeftSidebarContext.Provider
      value={{
        open,
        setOpen,
        activeSection,
        setActiveSection,
        activeSubSectionIndex,
        setActiveSubSectionIndex,
        expandedSections,
        setExpandedSections,
      }}
    >
      {children}
    </LeftSidebarContext.Provider>
  );
};

export default LeftSidebarProvider;

export const useLeftSidebar = () => {
  const context = useContext(LeftSidebarContext);
  if (!context) {
    throw new Error("useLeftSidebar must be used within a LeftSidebarProvider");
  }
  return context;
};
