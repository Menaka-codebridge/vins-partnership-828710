import React, { useRef, useState, useEffect } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import excelLogo from "../assets/media/excelLogo.svg";
import client from "./restClient";
import * as XLSX from "xlsx";
import axios from "axios";
import { requestOptions } from "../utils";
import _ from "lodash";

export default function UploadService({
  serviceName,
  user,
  onUploadComplete,
  disabled,
}) {
  const fileUploadRef = useRef(null);
  const [totalSize, setTotalSize] = useState(0);
  const [fileDetails, setFileDetails] = useState({});
  const [serviceFields, setServiceFields] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const toast = useRef(null);
  const dateFormat = process.env.REACT_APP_DATE;

  const fetchServiceFields = async (serviceName) => {
    try {
      const exclude = [
        "_id",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt",
      ];
      const serviceSchema = await axios(
        requestOptions(`${serviceName}Schema`, {})
      );
      const schema = serviceSchema.data.filter(
        (field) => !exclude.includes(field.field)
      );
      const req = schema.filter((field) => field.required === true);

      setServiceFields(schema);
      setRequiredFields(req);
    } catch (error) {
      console.error("Failed to fetch service schema:", error);
    }
  };

  useEffect(() => {
    fetchServiceFields(serviceName);
  }, [serviceName]);

  const onTemplateSelect = (e) => {
    try {
      let _totalSize = totalSize;
      let files = e.files;

      Object.keys(files).forEach(async (key) => {
        _totalSize += files[key].size || 0;
        await fileChecker(files[key]);
      });
      setTotalSize(_totalSize);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to calculate total size",
      });
    }
  };

  const onTemplateUpload = (e) => {
    try {
      let _totalSize = 0;

      e.files.forEach((file) => {
        _totalSize += file.size || 0;
      });

      setTotalSize(_totalSize);
      toast.current.show({
        severity: "info",
        summary: "Success",
        detail: "File Uploaded",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to upload file",
      });
    }
  };

  const onTemplateRemove = (file, callback) => {
    try {
      setTotalSize(totalSize - file.size);
      callback();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to remove file",
      });
    }
  };

  const onTemplateClear = () => {
    try {
      setTotalSize(0);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to clear files",
      });
    }
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formattedValue =
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
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formattedValue} / 10 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "12px" }}
          ></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: "40%" }}>
          <img alt="Excel Icon" src={excelLogo} width={50} />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>

        <div className="ml-auto flex align-items-center">
          <Tag
            value={fileDetails[file.name]?.successCount}
            severity="success"
            className="px-3 py-2 mr-3"
          />
          <Tag
            value={fileDetails[file.name]?.failRecords}
            severity="danger"
            className="px-3 py-2 mr-3"
          />
          <Tag
            value={props.formatSize}
            severity="warning"
            className="px-3 py-2 mr-3"
          />
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-outlined p-button-rounded p-button-danger"
            onClick={() => onTemplateRemove(file, props.onRemove)}
          />
        </div>
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-file-excel mt-3 p-5"
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
          Drag and Drop Excel File Here
        </span>
      </div>
    );
  };

  const fileChecker = async (file) => {
    try {
      if (!file) throw new Error("No file selected");

      const reader = new FileReader();
      const blob = await fetch(file.objectURL).then((r) => r.blob());
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1];
        const wb = XLSX.read(base64data, {
          type: "base64",
          dateNF: dateFormat,
        });
        const failRecords = [];
        let successCount = 0;
        let data = [];

        for (let i in wb.SheetNames) {
          const wsname = wb.SheetNames[i];
          const ws = wb.Sheets[wsname];
          let sheetData = XLSX.utils.sheet_to_json(ws);

          sheetData.forEach((row, i) => {
            const hasAllFields = serviceFields.every(
              (field) => field.field in row
            );
            const hasRequiredFields = requiredFields.every(
              (field) => row[field.field]
            );

            if (!hasAllFields || !hasRequiredFields) {
              failRecords.push({
                id: i,
                row: row,
                errorMessage: `Missing field or required fields is empty`,
              });
            } else {
              successCount++;
            }
          });

          if (!_.isEmpty(sheetData)) {
            if (_.isEmpty(data)) {
              data = sheetData.map((item) => ({
                ...item,
                createdBy: user?._id,
                updatedBy: user?._id,
              }));
            } else {
              data.push(
                sheetData.map((item) => ({
                  ...item,
                  createdBy: user?._id,
                  updatedBy: user?._id,
                }))
              );
            }
          }
        }

        const details = {};
        details[file.name] = {
          successCount,
          failRecords: failRecords,
          failedCount: failRecords.length,
        };
        setFileDetails(details);
      };
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "An error occurred during file checking",
      });
    }
  };

  const customBase64Uploader = async (event) => {
    const file = event.files[0];
    if (!file) throw new Error("No file selected");
    const totalFailures = Object.values(fileDetails).reduce((a, v) => {
      return a + v.failRecords;
    }, 0);
    if (totalFailures > 0) {
      toast.current.show({
        severity: "error",
        summary: `Total ${totalFailures} records failed.`,
        detail: "Corrrect the failures before continuing.",
      });
      return;
    }

    const reader = new FileReader();
    const blob = await fetch(file.objectURL).then((r) => r.blob());
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
      const base64data = reader.result.split(",")[1];
      const wb = XLSX.read(base64data, { type: "base64", dateNF: dateFormat });
      let data = [];

      for (let i in wb.SheetNames) {
        const wsname = wb.SheetNames[i];
        const ws = wb.Sheets[wsname];
        const sheetData = XLSX.utils.sheet_to_json(ws);

        if (!_.isEmpty(sheetData)) {
          if (_.isEmpty(data)) {
            data = sheetData.map((item) => ({
              ...item,
              createdBy: user?._id,
              updatedBy: user?._id,
            }));
          } else {
            data.push(
              sheetData.map((item) => ({
                ...item,
                createdBy: user?._id,
                updatedBy: user?._id,
              }))
            );
          }
        }
      }

      try {
        // add filter out existing data
        const currentData = await client.service(serviceName).find({});
        if (currentData.total > 0) {
          data.forEach((row) => {
            const rowIndexData = _.findIndex(
              currentData.data,
              { ...row, createdBy: user?._id, updatedBy: user?._id },
              0
            );
            if (rowIndexData >= 0) data.splice(rowIndexData, 1);
          });
        }
        const results = await client.service(serviceName).create(data);
        toast.current.show({
          severity: "info",
          summary: `Upload Summary`,
          detail: `Upload succeeded ${results.length}`,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: `Failed records - ${error.message}`,
          detail: "A confirmation email has been sent with the failed records.",
        });
      } finally {
        setTimeout(() => onUploadComplete(), 3000);
      }
    };
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast}></Toast>

      <div>
        <Tooltip
          target=".custom-choose-btn"
          content="Choose"
          position="bottom"
        />
        <Tooltip
          target=".custom-upload-btn"
          content="Upload"
          position="bottom"
        />
        <Tooltip
          target=".custom-cancel-btn"
          content="Clear"
          position="bottom"
        />

        <FileUpload
          ref={fileUploadRef}
          name="demo[]"
          url="/api/upload"
          accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          maxFileSize={25000000} // 1 MB
          onUpload={onTemplateUpload}
          onSelect={onTemplateSelect}
          onError={onTemplateClear}
          onClear={onTemplateClear}
          headerTemplate={headerTemplate}
          itemTemplate={itemTemplate}
          emptyTemplate={emptyTemplate}
          chooseOptions={{
            icon: "pi pi-fw pi-file",
            iconOnly: true,
            className: "custom-choose-btn p-button-rounded p-button-outlined",
          }}
          uploadOptions={{
            icon: "pi pi-fw pi-cloud-upload",
            iconOnly: true,
            className:
              "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
          }}
          cancelOptions={{
            icon: "pi pi-fw pi-times",
            iconOnly: true,
            className:
              "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
          }}
          customUpload
          uploadHandler={customBase64Uploader}
          disabled={disabled ? disabled : false}
        />
      </div>
    </div>
  );
}
