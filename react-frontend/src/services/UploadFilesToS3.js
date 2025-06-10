import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";

export const UploadFilesToS3 = (props) => {
    const toast = useRef(null);
    const [totalSize, setTotalSize] = useState(0);
    const [files, setFiles] = useState([]);
    const [returnedIds, setReturnedIds] = useState([]);
    const fileUploadRef = useRef(null);
    const uploadURL = `${process.env.REACT_APP_SERVER_URL}/s3uploader`;
    const [uploadedFileCount, setUploadedFileCount] = useState(0);

    const onTemplateSelect = (e) => {
        let _totalSize = totalSize;
        let newFiles = [...files]; // Start with existing files

        e.files.forEach((file) => {
            // Check for duplicates before adding
            if (!newFiles.some((f) => f.name === file.name && f.size === file.size)) {
                _totalSize += file.size || 0;
                newFiles.push(file);
            }
        });

        setFiles(newFiles);
        setTotalSize(_totalSize);
    };


    const onTemplateUpload = (e) => {
        // This might not be needed if you're using customUpload
        let _totalSize = 0;
        e.files.forEach((file) => {
            _totalSize += file.size || 0;
        });

        setTotalSize(_totalSize); // Keep track of total size
        toast.current.show({
            severity: "info",
            summary: "Success",
            detail: "File Uploaded",
        });
    };

    const onTemplateRemove = (file) => {
        setTotalSize((prevTotalSize) => prevTotalSize - file.size);

        setFiles((prevFiles) => {
            const index = prevFiles.findIndex((f) => f.name === file.name && f.size === file.size);
            if (index > -1) {
                const newFiles = [...prevFiles];
                newFiles.splice(index, 1);
                return newFiles;
            }
            return prevFiles;
        });


        // Remove the corresponding ID when a file is removed
        setReturnedIds((prevIds) => {
            const index = files.findIndex((f) => f.name === file.name && f.size === file.size);
            if (index > -1) {
                const updatedIds = [...prevIds];
                updatedIds.splice(index, 1);
                return updatedIds;
            }
           return prevIds;
        });

        setUploadedFileCount((prevCount) => Math.max(0, prevCount - 1));
    };

    const onTemplateClear = () => {
        setTotalSize(0);
        setFiles([]);
        setReturnedIds([]);
        setUploadedFileCount(0);
        if (props.onUploadComplete) {
            props.onUploadComplete([]);
        }
    };


    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const value = totalSize / 1000000; // Convert to MB for the progress bar
        const formatedValue =
            fileUploadRef && fileUploadRef.current
                ? fileUploadRef.current.formatSize(totalSize)
                : "0 B";

        return (
            <div
                className={className}
                style={{
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    width: "100%", // Ensure it takes full width
                }}
            >
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue} / 25 MB</span>
                    <ProgressBar
                        value={value * (100 / 25)} // Calculate percentage based on 25MB max
                        showValue={false}
                        style={{ width: "10rem", height: "12px" }}
                    ></ProgressBar>
                </div>
            </div>
        );
    };

    const logo = (file) => {
        //  return file.objectURL;  // Use objectURL directly for images
        const regex = new RegExp("image/*");
        if (regex.test(file.type)) {
          return file.objectURL
        }

        switch (file.type) {
            case "application/pdf":
                return "../assets/media/pdf.svg";
            case "text/csv":
                return "../assets/media/csv.svg";
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "../assets/media/excelLogo.svg";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "../assets/media/docx.svg";
            case "application/msword":
                return "../assets/media/doc.svg";
            case "vnd.ms-powerpoint":
                return "../assets/media/ppt.svg";
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                return "../assets/media/pptx.svg";
            case "image/jpeg":
                return "../assets/media/jpg.svg";
            case "image/jpg":
              return "../assets/media/jpg.svg";
            case "image/png":
                return "../assets/media/png.svg";
            case "text/plain":
                return "../assets/media/txt.svg";
            case "application/zip":
                return "../assets/media/zip.svg";
            default:
                return "../assets/media/txt.svg";
        }

    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap" style={{width: '100%'}}>
                <div className="flex align-items-center" style={{ width: "60%" }}> {/* Increased width for image and name */}
                    <img
                        alt={file.name}
                        role="presentation"
                        src={logo(file)}
                        width={60}  // Smaller image
                        style={{marginRight: '1rem'}} // Add some margin
                    />
                    <span className="flex flex-column text-left">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <div style={{ width: '20%', textAlign: 'center' }}> {/* Centered Tag */}
                   <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                </div>

                <div style={{ width: '20%', textAlign: 'right' }}>  {/* Right-aligned Button */}
                  <Button
                      type="button"
                      icon="pi pi-times"
                      className="p-button-outlined p-button-rounded p-button-danger"
                      onClick={() => onTemplateRemove(file)}
                  />
              </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i
                    className="pi pi-file-o mt-3 p-5"  // Changed icon to pi-file-o
                    style={{
                        fontSize: "5em",
                        borderRadius: "50%",
                        backgroundColor: "var(--surface-b)",
                        color: "var(--surface-d)",
                    }}
                ></i>
                <span
                    style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
                    className="my-5"
                >
                    Drag and Drop Files Here
                </span>
            </div>
        );
    };

    const chooseOptions = {
        icon: "pi pi-fw pi-file", // Consistent file icon
        iconOnly: true,
        className: "custom-choose-btn p-button-rounded p-button-outlined",
    };
    const uploadOptions = {
        icon: "pi pi-fw pi-cloud-upload",
        iconOnly: true,
        className:
            "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
    };
    const cancelOptions = {
        icon: "pi pi-fw pi-times",
        iconOnly: true,
        className:
            "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
    };

    const uploadFile = async (e) => {
        if (e.files.length > 0) {
            try {
                const formData = new FormData();
                e.files.forEach((file) => {
                    formData.append("files", file);
                });

                formData.append("tableId", props.id);
                formData.append("tableName", props.serviceName);
                formData.append("user", JSON.stringify(props.user ? props.user : {}));

                const response = await fetch(uploadURL, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result?.results && result.results.length > 0) {
                    const documentIds = result.results.map((res) => res.documentId);
                    setReturnedIds((prevIds) => [...prevIds, ...documentIds]);
                    setUploadedFileCount((prevCount) => prevCount + e.files.length);

                    if (props.onUploadComplete) {
                         props.onUploadComplete([...returnedIds, ...documentIds]);
                    }
                }

                toast.current.show({
                    severity: "success",
                    summary: "Upload Successful",
                    detail: "Your files have been uploaded.",
                });
            } catch (error) {
                console.error("Upload error:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Upload Failed",
                    detail: "File upload failed.",
                });
            }
        }
    };
    const onUpload = () => {
      toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  };


    return (
        <div>
            <Toast ref={toast}></Toast>

            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            <FileUpload
                ref={fileUploadRef}
                name="file"
                mode="advanced"  // Use "advanced" mode
                multiple
                customUpload
                uploadHandler={uploadFile}
                onUpload={onUpload}
                onSelect={onTemplateSelect}
                onRemove={onTemplateRemove} // Add onRemove
                onClear={onTemplateClear}
                headerTemplate={headerTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions}
                accept=".csv, .pdf, .doc, .docx, image/*, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                maxFileSize={25000000}
                className="custom-file-upload" // Add a custom class for styling
                style={{width: '100%'}}
            />
        </div>
    );
};
export default UploadFilesToS3;