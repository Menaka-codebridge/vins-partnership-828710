import React, { useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import ProjectLayout from "../../Layouts/ProjectLayout";
import CreateCaseDialog from "./CreateCaseDialog"; // Import the new dialog component

const DashboardPage = (props) => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false); // State for dialog visibility

  const openCreateCaseDialog = () => {
    console.log("Open Create Case dialog...");
    setShowCreateDialog(true); // Set state to true to show dialog
  };

  const goToViewCases = () => {
    console.log("Navigate to View All Cases page...");
    navigate("/accidentCases");
  };

  const goToHistory = () => {
    console.log("Navigate to Prompts History page...");
    navigate("/histories");
  };

  const handlePlaceholderAction = () => {
    console.log("Placeholder button clicked...");
  };

  const handleDialogHide = () => {
    setShowCreateDialog(false);
  };

  const handleCaseCreated = (newCaseData) => {
    console.log("Case created (simulated):", newCaseData);
    // Potentially navigate to the new case page or refresh list
    setShowCreateDialog(false);
    // navigate(`/cases/${newCaseData._id}`); // Example navigation after creation
  };

  return (
    <ProjectLayout>
      <div className="dashboard-container">
        <div className="dashboard-main-content p-grid p-align-center p-jc-center">
          <div className="watermark"></div>

          <div className="p-col-12 p-md-5 p-lg-4 content-left">
            <Image
              src="./assets/logo/vinsLogo.png"
              alt="VIN Partnership Logo"
              width="300"
              className="main-logo"
            />
          </div>

          <div className="p-col-12 p-md-7 p-lg-6 content-right">
            <h1 className="title">VIN Partnership's Case Management</h1>
            <h2 className="subtitle">(Legal AI)</h2>
            <Divider className="title-divider-left" />
            <div className="action-buttons p-mt-4">
              <Button
                label="Create Case"
                icon="pi pi-plus"
                className="p-button-raised p-mb-3 action-button"
                onClick={openCreateCaseDialog} // Changed onClick handler
              />
              <Button
                label="View All Cases"
                icon="pi pi-list"
                className="p-button-outlined p-mb-3 action-button"
                onClick={goToViewCases}
              />
              <Button
                label="View Prompts History"
                icon="pi pi-history"
                className="p-button-outlined p-mb-3 action-button"
                onClick={goToHistory}
              />
              {/* <Button
                label="*insert_anything*"
                className="p-button-outlined p-button-secondary p-mb-3 action-button"
                onClick={handlePlaceholderAction}
                disabled
              /> */}
            </div>
          </div>
        </div>

        {/* Render the Dialog */}
        <CreateCaseDialog
          show={showCreateDialog}
          onHide={handleDialogHide}
          onCaseCreated={handleCaseCreated} // Callback when case is successfully created
        />

        <style jsx global>{`
          :root {
            --theme-primary: #511718;
            --theme-secondary: #260b0b;
            --theme-text-on-dark: #f8f9fa;
            --theme-text-on-light: #260b0b;
            --theme-background: #f4f5f7;
            --theme-content-bg: #ffffff;
            --theme-border: #d1d5db;
            --theme-primary-hover: #401213;
          }
          body {
            margin: 0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--theme-background);
          }
          .dashboard-container {
            min-height: calc(100vh - 0px);
            display: flex;
            flex-direction: column;
          }
          .dashboard-main-content {
            flex-grow: 1;
            padding: 4rem 2rem;
            position: relative;
            background-color: var(--theme-content-bg);
            border-radius: 8px;
            margin: 1.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            height: 350px;
            background-image: url("./assets/logo/backgroundLogo.png"); /* ** UPDATE THIS PATH ** */
            background-size: contain;
            background-repeat: no-repeat;
            opacity: 0.06;
            z-index: 0;
          }
          .content-left,
          .content-right {
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
          }
          .content-left {
            align-items: center;
          }
          .content-right {
            align-items: flex-start;
            text-align: left;
            width: 100%;
            max-width: 500px;
          }
          .main-logo {
            max-width: 100%;
            height: auto;
          }
          .title {
            font-size: 2rem;
            color: var(--theme-secondary);
            margin-bottom: 0.25rem;
            font-weight: 600;
          }
          .subtitle {
            font-size: 1.4rem;
            color: var(--theme-primary);
            margin-top: 0;
            margin-bottom: 1.5rem;
            font-weight: 400;
          }
          .title-divider-left {
            width: 100px;
            border-top: 3px solid var(--theme-primary);
            margin: 0.5rem 0 2rem 0;
          }
          .action-buttons {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }
          .action-button {
            width: 100%;
            padding: 0.8rem 1rem;
            font-size: 1rem;
            font-weight: 500;
            justify-content: flex-start;
            border-radius: 6px;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }
          .action-button .p-button-icon-left {
            margin-right: 0.75rem;
          }
          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          }
          .action-button.p-button-raised {
            background-color: var(--theme-primary);
            border-color: var(--theme-primary);
            color: var(--theme-text-on-dark);
          }
          .action-button.p-button-raised:enabled:hover {
            background-color: var(--theme-primary-hover);
            border-color: var(--theme-primary-hover);
          }
          .action-button.p-button-outlined {
            border-color: var(--theme-primary);
            color: var(--theme-primary);
          }
          .action-button.p-button-outlined:enabled:hover {
            background-color: rgba(81, 23, 24, 0.05);
          }
          .action-button.p-button-secondary {
            border-color: var(--theme-border);
            color: var(--text-color-secondary);
          }
          .action-button.p-button-secondary:enabled:hover {
            background-color: var(--surface-hover);
          }
          @media (max-width: 767px) {
            .dashboard-main-content {
              padding: 2rem 1rem;
              flex-direction: column;
            }
            .content-left {
              margin-bottom: 2rem;
            }
            .content-right {
              align-items: center !important;
              text-align: center;
            }
            .title-divider-left {
              margin-left: auto;
              margin-right: auto;
            }
            .action-button {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </ProjectLayout>
  );
};

export default DashboardPage;
