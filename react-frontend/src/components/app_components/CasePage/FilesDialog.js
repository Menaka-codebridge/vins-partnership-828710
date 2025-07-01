import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { FileUpload } from "primereact/fileupload";
import { ScrollPanel } from "primereact/scrollpanel";
import { Divider } from "primereact/divider";

// Helper function to get file icon
const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (type === "pdf") return "pi pi-file-pdf";
  if (type === "doc" || type === "docx") return "pi pi-file-word";
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(type))
    return "pi pi-image";
  return "pi pi-file";
};

const FilesDialog = ({
  show,
  onHide,
  documents = [],
  images = [],
  onFilesUpload,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const fileUploadRef = useRef(null);

  // Handle selection in FileUpload component
  const handleFileSelect = (event) => {
    const newFiles = event.files;
    setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
    console.log("Files selected for upload queue:", newFiles);
    fileUploadRef.current?.clear();
  };

  // Simulate upload action
  const handleUploadClick = () => {
    if (filesToUpload.length > 0) {
      console.log(
        "Simulating upload of:",
        filesToUpload.map((f) => f.name),
      );
      onFilesUpload(filesToUpload);
      setFilesToUpload([]);
      setActiveIndex(0);
    } else {
      console.log("No files selected to upload.");
    }
  };

  // Handle eye icon click for viewing files
  const handleViewFile = (file) => {
    if (!file.url) {
      console.error(`No URL found for file: ${file.name}`);
      return;
    }
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    if (imageTypes.includes(file.type?.toLowerCase())) {
      setPreviewImage(file.url);
      setShowPreviewDialog(true);
    } else {
      window.open(file.url, "_blank");
    }
  };

  // Custom empty template for FileUpload
  const fileUploadEmptyTemplate = () => {
    return (
      <div className="p-d-flex p-ai-center p-flex-column p-py-6 p-text-center empty-template-container">
        <i className="pi pi-cloud-upload upload-icon"></i>
        <p className="p-mt-3 p-mb-0 p-text-secondary">
          Drag and drop files here or
        </p>
        <Button
          label="Browse Files"
          type="button"
          icon="pi pi-plus"
          className="p-button-text p-mt-2 choose-button-link"
          onClick={() => fileUploadRef.current?.getInput().click()}
        />
      </div>
    );
  };

  const renderFileList = (files) => (
    <ul className="file-list-dialog p-p-0">
      {files.map((file) => (
        <li
          key={file.id || file.name}
          className="p-d-flex p-ai-center p-mb-2 file-list-item"
        >
          <i
            className={`${getFileIcon(file.type)} p-mr-2 file-icon file-icon-${file.type?.toLowerCase() || "file"}`}
          ></i>
          <span className="p-text-truncate file-name">{file.name}</span>
          <Button
            icon="pi pi-eye"
            className="p-button-text p-button-sm p-button-secondary p-ml-auto p-mr-1"
            tooltip={file.url ? "View File" : "No Preview Available"}
            tooltipOptions={{ position: "left" }}
            onClick={() => handleViewFile(file)}
            disabled={!file.url}
          />
          <Button
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            tooltip="Delete (Not Implemented)"
            tooltipOptions={{ position: "left" }}
            disabled
          />
        </li>
      ))}
      {files.length === 0 && (
        <li className="p-text-secondary p-text-center p-p-3">
          No files of this type found.
        </li>
      )}
    </ul>
  );

  return (
    <>
      <Dialog
        header="Manage Case Files"
        visible={show}
        style={{ width: "55vw", maxWidth: "750px", minWidth: "500px" }}
        modal
        onHide={onHide}
        className="files-dialog themed-dialog"
        blockScroll
        maximizable
      >
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
          className="themed-dialog-tabs file-tabs"
        >
          <TabPanel header="Documents" leftIcon="pi pi-fw pi-file p-mr-2">
            <ScrollPanel
              style={{ width: "100%", height: "45vh" }}
              className="p-pr-2 custom-scrollbar"
            >
              <h5 className="section-title p-mb-2">Documents</h5>
              {renderFileList(documents)}
              {images.length > 0 && (
                <>
                  <Divider className="p-my-3" />
                  <h5 className="section-title p-mb-2">Images</h5>
                  {renderFileList(images)}
                </>
              )}
              {documents.length === 0 && images.length === 0 && (
                <p className="p-text-secondary p-text-center p-mt-6">
                  No documents or images associated with this case yet.
                </p>
              )}
            </ScrollPanel>
          </TabPanel>
          <TabPanel
            header="Upload new files"
            leftIcon="pi pi-fw pi-upload p-mr-2"
          >
            <div className="p-fluid upload-tab-content">
              <FileUpload
                ref={fileUploadRef}
                name="newCaseFiles[]"
                multiple
                accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxFileSize={5000000}
                customUpload={true}
                onSelect={handleFileSelect}
                onError={(e) => {
                  console.error("Upload Select Error:", e);
                }}
                emptyTemplate={fileUploadEmptyTemplate}
                progressBarTemplate={<></>}
                chooseOptions={{ style: { display: "none" } }}
                uploadOptions={{ style: { display: "none" } }}
                cancelOptions={{ style: { display: "none" } }}
                className="themed-fileupload upload-area"
              />
              {filesToUpload.length > 0 && (
                <div className="p-mt-3 upload-actions">
                  <Divider />
                  <h6 className="p-mb-2">
                    {filesToUpload.length} file(s) selected for upload:
                  </h6>
                  <ul className="selected-files-list">
                    {filesToUpload.map((f) => (
                      <li key={f.name}>
                        <i className="pi pi-file p-mr-1"></i>
                        {f.name}
                      </li>
                    ))}
                  </ul>
                  <Button
                    label={`Upload Selected Files`}
                    icon="pi pi-upload"
                    className="p-mt-3 p-button-sm themed-button-prime"
                    onClick={handleUploadClick}
                  />
                  <Button
                    label="Clear Selection"
                    icon="pi pi-times"
                    className="p-mt-3 p-ml-2 p-button-sm p-button-outlined p-button-secondary"
                    onClick={() => {
                      setFilesToUpload([]);
                      fileUploadRef.current?.clear();
                    }}
                  />
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        header="Image Preview"
        visible={showPreviewDialog}
        style={{ width: "80vw", maxWidth: "800px" }}
        modal
        onHide={() => {
          setShowPreviewDialog(false);
          setPreviewImage(null);
        }}
        className="image-preview-dialog themed-dialog"
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
            }}
          />
        ) : (
          <p className="p-text-center p-text-secondary">No image available.</p>
        )}
      </Dialog>

      {/* --- Files Dialog Styling --- */}
      <style jsx global>{`
        /* --- Theme Variables --- */
        :root {
          --theme-primary: #511718;
          --theme-secondary: #260b0b;
          --theme-text-on-dark: #f8f9fa;
          --theme-text-on-light: #260b0b;
          --theme-background: #f4f5f7;
          --theme-panel-bg: #ffffff;
          --theme-muted-bg: #f8f9fa;
          --theme-border: #d1d5db;
          --theme-primary-hover: #401213;
        }

        /* --- Dialog Base --- */
        .files-dialog .p-dialog-header,
        .image-preview-dialog .p-dialog-header {
          background-color: var(--theme-secondary);
          color: var(--theme-text-on-dark);
          border-bottom: none;
          padding: 1rem 1.5rem;
          border-radius: 6px 6px 0 0;
        }
        .files-dialog .p-dialog-title,
        .image-preview-dialog .p-dialog-title {
          font-weight: 600;
        }
        .files-dialog .p-dialog-header-icon,
        .image-preview-dialog .p-dialog-header-icon {
          color: var(--theme-text-on-dark) !important;
        }
        .files-dialog .p-dialog-content,
        .image-preview-dialog .p-dialog-content {
          padding: 0;
          background-color: var(--theme-panel-bg);
          min-height: 50vh;
          display: flex;
          flex-direction: column;
        }
        .files-dialog .p-tabview.file-tabs {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .files-dialog .p-tabview-panels {
          flex-grow: 1;
          background: var(--theme-panel-bg);
          padding: 0;
        }
        .files-dialog .p-tabview-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .files-dialog .p-scrollpanel.custom-scrollbar .p-scrollpanel-content {
          padding-right: 5px;
        }
        .files-dialog .p-scrollpanel.custom-scrollbar .p-scrollpanel-bar {
          background-color: var(--theme-border);
          opacity: 0.7;
          width: 8px;
        }

        /* --- Image Preview Dialog --- */
        .image-preview-dialog .p-dialog-content {
          padding: 1.5rem;
          min-height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* --- Tabs --- */
        .themed-dialog-tabs.file-tabs .p-tabview-nav {
          background: var(--theme-muted-bg);
          border-bottom: 1px solid var(--theme-border);
          padding: 0 1rem;
        }
        .themed-dialog-tabs.file-tabs .p-tabview-nav-link {
          font-size: 0.95rem;
          padding: 0.8rem 1.2rem;
          border: 0 !important;
          border-bottom: 3px solid transparent !important;
          color: var(--theme-secondary);
          font-weight: 500;
          transition:
            background-color 0.2s,
            color 0.2s,
            border-color 0.2s;
          margin-bottom: -1px;
        }
        .themed-dialog-tabs.file-tabs
          .p-tabview-nav-link:not(.p-highlight):hover {
          background-color: #e9ecef !important;
          color: var(--theme-primary);
          border-bottom-color: var(--theme-border) !important;
        }
        .themed-dialog-tabs.file-tabs .p-highlight .p-tabview-nav-link {
          color: var(--theme-primary);
          border-color: var(--theme-primary) !important;
          background: var(--theme-panel-bg) !important;
          font-weight: 600;
        }

        /* --- File List Styling --- */
        .files-dialog .p-tabview-panels {
          padding: 1.5rem;
        }
        .section-title {
          font-weight: 600;
          color: var(--theme-secondary);
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          border-bottom: 1px solid var(--theme-border);
          padding-bottom: 0.5rem;
        }
        .file-list-dialog {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .file-list-dialog li {
          border-bottom: 1px solid var(--theme-border);
          padding: 0.6rem 0.25rem;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
        }
        .file-list-dialog li:last-child {
          border-bottom: none;
        }
        .file-list-dialog li:hover {
          background-color: var(--theme-muted-bg);
        }
        .file-list-dialog .file-icon {
          font-size: 1.2rem;
          vertical-align: middle;
          color: var(--theme-secondary);
          min-width: 20px;
        }
        .file-list-dialog .file-icon-pdf {
          color: #d32f2f;
        }
        .file-list-dialog .file-icon-docx,
        .file-list-dialog .file-icon-doc {
          color: #1976d2;
        }
        .file-list-dialog .file-icon-jpg,
        .file-list-dialog .file-icon-jpeg,
        .file-list-dialog .file-icon-png,
        .file-list-dialog .file-icon-gif,
        .file-list-dialog .file-icon-webp {
          color: #388e3c;
        }
        .file-list-dialog .file-name {
          margin-left: 0.5rem;
          color: var(--theme-text-on-light);
          font-size: 0.95rem;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-list-dialog .p-button-sm {
          height: 1.8rem;
          width: 1.8rem;
        }

        /* --- File Upload Tab Styling --- */
        .upload-tab-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .upload-area.themed-fileupload {
          border: none;
          padding: 0;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .upload-area.themed-fileupload .p-fileupload-content {
          border: 2px dashed var(--theme-border);
          border-radius: 6px;
          background: var(--theme-muted-bg);
          padding: 1.5rem;
          transition: border-color 0.2s;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upload-area.themed-fileupload .p-fileupload-content:hover {
          border-color: var(--theme-primary);
        }
        .empty-template-container .upload-icon {
          font-size: 3rem !important;
          color: var(--theme-border) !important;
        }
        .empty-template-container .choose-button-link {
          font-weight: 600;
          color: var(--theme-primary);
        }
        .upload-actions {
          border-top: 1px solid var(--theme-border);
          padding-top: 1rem;
        }
        .selected-files-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: var(--text-color-secondary);
          max-height: 100px;
          overflow-y: auto;
        }

        /* --- General Button Styling --- */
        .themed-button-prime {
          background: var(--theme-primary);
          border-color: var(--theme-primary);
          color: var(--theme-text-on-dark);
        }
        .themed-button-prime:enabled:hover {
          background: var(--theme-primary-hover);
          border-color: var(--theme-primary-hover);
        }
      `}</style>
    </>
  );
};

export default FilesDialog;
