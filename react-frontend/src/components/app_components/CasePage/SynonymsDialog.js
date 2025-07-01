import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Chip } from "primereact/chip";
import { ScrollPanel } from "primereact/scrollpanel";
import { Divider } from "primereact/divider";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import client from "../../../services/restClient";

const SynonymsDialog = ({
  show,
  onHide,
  initialSynonyms = [],
  accidentCaseId,
}) => {
  const [synonyms, setSynonyms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingSynonym, setEditingSynonym] = useState(null); // Holds the synonym being edited { index, data }
  const [newPrimary, setNewPrimary] = useState("");
  const [newSynonymsText, setNewSynonymsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize state when dialog opens or initial data changes
  useEffect(() => {
    if (show) {
      // Deep copy to prevent modifying original prop directly
      setSynonyms(JSON.parse(JSON.stringify(initialSynonyms)));
      setSearchTerm("");
      setIsAdding(false);
      setEditingSynonym(null);
      setError("");
    }
  }, [show, initialSynonyms]);

  // --- Add/Edit Functionality ---
  const startAdd = () => {
    setEditingSynonym(null); // Ensure not editing
    setNewPrimary("");
    setNewSynonymsText("");
    setIsAdding(true); // Show add form
    setError("");
  };

  const cancelAddEdit = () => {
    setIsAdding(false);
    setEditingSynonym(null);
    setNewPrimary("");
    setNewSynonymsText("");
    setError("");
  };

  const saveNewOrUpdateSynonym = async () => {
    if (!newPrimary.trim()) {
      setError("Primary word is required.");
      return;
    }
    const synonymsList = newSynonymsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s); // Split by comma, trim, remove empty

    setLoading(true);
    setError("");

    try {
      let updatedSynonyms;
      if (editingSynonym !== null) {
        // Update existing
        updatedSynonyms = [...synonyms];
        updatedSynonyms[editingSynonym.index] = {
          ...editingSynonym.data,
          primary: newPrimary,
          synonymsList,
        };
      } else {
        // Add new
        const newEntry = {
          primary: newPrimary,
          synonymsList: synonymsList,
        };
        updatedSynonyms = [...synonyms, newEntry];
      }

      // Update the accidentCases record in the database
      await client.service("accidentCases").patch(accidentCaseId, {
        synonyms: updatedSynonyms,
      });

      // Update local state
      setSynonyms(updatedSynonyms);
      cancelAddEdit(); // Hide form
    } catch (err) {
      setError(err.message || "Failed to save synonym.");
      console.error("Error saving synonym:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Functionality ---
  const startEdit = (synonymEntry, index) => {
    setIsAdding(false); // Ensure not adding
    setEditingSynonym({ index, data: synonymEntry });
    setNewPrimary(synonymEntry.primary);
    setNewSynonymsText(synonymEntry.synonymsList.join(", ")); // Join for editing
    setError("");
  };

  // --- Delete Functionality ---
  const deleteSynonym = async (indexToDelete) => {
    setLoading(true);
    setError("");

    try {
      const updatedSynonyms = synonyms.filter(
        (_, index) => index !== indexToDelete,
      );

      // Update the accidentCases record in the database
      await client.service("accidentCases").patch(accidentCaseId, {
        synonyms: updatedSynonyms,
      });

      // Update local state
      setSynonyms(updatedSynonyms);

      // If currently editing the one being deleted, cancel edit mode
      if (editingSynonym?.index === indexToDelete) {
        cancelAddEdit();
      }
    } catch (err) {
      setError(err.message || "Failed to delete synonym.");
      console.error("Error deleting synonym:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter synonyms based on search term
  const filteredSynonyms = synonyms.filter(
    (item) =>
      item.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.synonymsList.some((syn) =>
        syn.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const renderFooter = () => (
    <div className="dialog-footer">
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text p-button-secondary"
        disabled={loading}
      />
    </div>
  );

  const renderAddEditForm = () => (
    <div
      className="p-mb-4 p-p-3"
      style={{
        border: "1px solid var(--theme-border)",
        borderRadius: "6px",
        background: "var(--theme-muted-bg)",
      }}
    >
      <h5>{editingSynonym !== null ? "Edit Synonym" : "Add New Synonym"}</h5>
      {error && <Message severity="error" text={error} className="p-mb-3" />}
      {loading && (
        <div className="p-text-center p-mb-3">
          <ProgressSpinner style={{ width: "30px", height: "30px" }} />
        </div>
      )}
      <div className="p-fluid p-formgrid p-grid">
        <div className="p-field p-col-12">
          <label htmlFor="primaryWord">Primary Word</label>
          <InputText
            id="primaryWord"
            value={newPrimary}
            onChange={(e) => setNewPrimary(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="p-field p-col-12">
          <label htmlFor="synonymsList">Synonyms (comma-separated)</label>
          <InputTextarea
            id="synonymsList"
            value={newSynonymsText}
            onChange={(e) => setNewSynonymsText(e.target.value)}
            rows={3}
            autoResize
            disabled={loading}
          />
        </div>
      </div>
      <div className="p-d-flex p-jc-end p-mt-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-text p-button-secondary p-mr-2 p-button-sm"
          onClick={cancelAddEdit}
          disabled={loading}
        />
        <Button
          label={editingSynonym !== null ? "Update" : "Add"}
          icon="pi pi-check"
          className="p-button-sm themed-button-prime"
          onClick={saveNewOrUpdateSynonym}
          disabled={loading}
          loading={loading}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header="Manage Synonyms"
      visible={show}
      style={{ width: "65vw", maxWidth: "850px", minWidth: "550px" }}
      modal
      footer={renderFooter()}
      onHide={onHide}
      className="synonyms-dialog themed-dialog"
      blockScroll
    >
      {/* Top Bar: Add Button + Search */}
      <div className="p-d-flex p-jc-between p-ai-center p-mb-3 dialog-top-bar">
        <Button
          label="Add New Synonym"
          icon="pi pi-plus"
          className="p-button-sm themed-button-prime"
          onClick={startAdd}
          disabled={isAdding || editingSynonym !== null || loading}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search synonyms..."
            className="p-inputtext-sm search-input"
            disabled={loading}
          />
        </span>
      </div>

      {error && !isAdding && !editingSynManifest && (
        <Message severity="error" text={error} className="p-mb-3" />
      )}
      {loading && !isAdding && !editingSynonym && (
        <div className="p-text-center p-mb-3">
          <ProgressSpinner style={{ width: "30px", height: "30px" }} />
        </div>
      )}

      {/* Add/Edit Form Area */}
      {(isAdding || editingSynonym !== null) && renderAddEditForm()}

      <Divider />

      {/* List Area */}
      <ScrollPanel
        style={{ width: "100%", height: "50vh" }}
        className="custom-scrollbar p-pr-2"
      >
        {filteredSynonyms.length > 0 ? (
          filteredSynonyms.map((item, index) => (
            <div
              key={item._id || `syn-${index}`}
              className="synonym-entry p-mb-3"
            >
              <div className="p-d-flex p-jc-between p-ai-start">
                <div>
                  <div className="p-mb-1">
                    <strong className="primary-label">Primary:</strong>
                    <span className="primary-word">{item.primary}</span>
                  </div>
                  <div className="p-d-flex p-flex-wrap p-ai-center">
                    <strong className="synonyms-label p-mr-2">Synonyms:</strong>
                    {item.synonymsList?.map((syn, synIndex) => (
                      <Chip
                        key={`${item._id || index}-${synIndex}`}
                        label={syn}
                        className="p-mr-2 p-mb-2 themed-chip"
                      />
                    ))}
                    {(!item.synonymsList || item.synonymsList.length === 0) && (
                      <span className="p-text-italic p-text-sm">
                        No synonyms listed
                      </span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="entry-actions">
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-text p-button-sm p-button-secondary p-mr-1"
                    tooltip="Edit"
                    onClick={() => startEdit(item, index)}
                    disabled={isAdding || editingSynonym !== null || loading}
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger p-button-sm"
                    tooltip="Delete"
                    onClick={() => deleteSynonym(index)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-text-secondary p-text-center p-mt-4">
            No synonyms found{searchTerm ? " matching search." : "."}
          </p>
        )}
      </ScrollPanel>

      {/* Synonyms Dialog Styling */}
      <style jsx global>{`
        .synonyms-dialog .p-dialog-content {
          padding: 1.5rem;
        }
        .dialog-top-bar {
          border-bottom: 1px solid var(--theme-border);
          padding-bottom: 1rem;
        }
        .search-input {
          height: 2.5rem;
          border-radius: 6px;
        }
        .synonym-entry {
          border: 1px solid var(--theme-border);
          border-radius: 6px;
          padding: 1rem;
          background-color: var(--theme-panel-bg);
          position: relative;
          transition: box-shadow 0.2s;
        }
        .synonym-entry:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .primary-label,
        .synonyms-label {
          font-weight: 600;
          color: var(--theme-secondary);
          font-size: 0.9rem;
        }
        .primary-word {
          margin-left: 0.5rem;
          font-weight: 500;
          font-size: 1rem;
          color: var(--theme-primary);
        }
        .themed-chip {
          background: #e9ecef;
          color: #495057;
          font-size: 0.8rem; /* Reduced font size for smaller tags */
          border-radius: 12px;
          padding: 0.15rem 0.6rem; /* Reduced padding to decrease height */
          line-height: 1.2; /* Adjusted line height for better text alignment */
          margin-right: 0.5rem; /* Ensure spacing between chips */
          margin-bottom: 0.5rem; /* Ensure spacing below chips */
        }
        .entry-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .synonym-entry:hover .entry-actions {
          opacity: 1;
        }
        .p-scrollpanel.custom-scrollbar .p-scrollpanel-bar {
          background-color: var(--theme-border);
          opacity: 0.7;
          width: 8px;
        }
        /* Add/Edit Form Styling */
        .add-edit-form .p-field {
          margin-bottom: 1rem;
        }
        .add-edit-form label {
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--theme-secondary);
        }
      `}</style>
    </Dialog>
  );
};

export default SynonymsDialog;
