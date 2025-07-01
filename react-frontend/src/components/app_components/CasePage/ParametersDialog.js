// src/pages/ParametersDialog.js

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { Chip } from "primereact/chip";

const ParametersDialog = ({
  show,
  onHide,
  onSave,
  initialTemperature,
  initialTopK,
  initialTopP,
  initialMaxLength,
}) => {
  // Internal state for sliders, initialized from props
  const [temp, setTemp] = useState(initialTemperature);
  const [k, setK] = useState(initialTopK);
  const [p, setP] = useState(initialTopP);
  const [maxLen, setMaxLen] = useState(initialMaxLength);
  // Assuming stop sequences are fixed for this dialog
  const stopSequences = ["Human:"]; // Match example format

  // Reset internal state when props change (e.g., dialog is reshown with potentially updated global state)
  useEffect(() => {
    if (show) {
      setTemp(initialTemperature ?? 0.5);
      setK(initialTopK ?? 250);
      setP(initialTopP ?? 0.5);
      setMaxLen(initialMaxLength ?? 2048);
    }
  }, [show, initialTemperature, initialTopK, initialTopP, initialMaxLength]);

  const handleSave = () => {
    // Pass the internal state values back to the parent on save
    onSave({
      temperature: temp,
      topK: k,
      topP: p,
      maxLength: maxLen,
    });
  };

  const handleReset = () => {
    // Reset sliders to initial prop values or defaults
    setTemp(initialTemperature || 0.5);
    setK(initialTopK || 250);
    setP(initialTopP || 0.5);
    setMaxLen(initialMaxLength || 2048);
  };

  const renderFooter = () => (
    <div className="dialog-footer">
      <Button
        label="Reset Defaults"
        icon="pi pi-refresh"
        onClick={handleReset}
        className="p-button-text p-button-secondary p-button-sm"
      />
      <div>
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onHide}
          className="p-button-text p-button-secondary p-button-sm p-mr-2"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          onClick={handleSave}
          className="p-button-sm themed-button-prime"
        />
      </div>
    </div>
  );

  // Function to map slider value (0-100) to temperature (0.0-1.0)
  const handleTempChange = (e) => setTemp(e.value / 100);
  // Function to map slider value (0-100) to TopK (0-500)
  const handleTopKChange = (e) => setK(Math.round(e.value * 5)); // 100 * 5 = 500
  // Function to map slider value (0-100) to TopP (0.0-1.0)
  const handleTopPChange = (e) => setP(e.value / 100);
  // Function to map slider value (0-100) to MaxLength (0-4096)
  const handleMaxLengthChange = (e) => setMaxLen(Math.round(e.value * 40.96)); // 100 * 40.96 = 4096

  return (
    <Dialog
      header="The parameters"
      visible={show}
      style={{ width: "350px" }} // Narrower dialog
      modal
      footer={renderFooter()}
      onHide={onHide}
      className="parameters-dialog themed-dialog" // Apply theme
      blockScroll
      headerClassName="params-dialog-header" // Custom class for header
    >
      <div className="p-fluid p-formgrid p-grid">
        {/* Temperature */}
        <div className="p-field p-col-12 p-mb-4">
          <label htmlFor="tempSlider" className="param-label p-mb-2">
            Randomness {temp.toFixed(2)}
          </label>
          <div className="p-d-flex p-ai-center slider-container">
            <span className="p-text-sm p-text-secondary p-mr-2">strict=0</span>
            <Slider
              id="tempSlider"
              ariaLabelledBy="label_temperature"
              value={Math.round(temp * 100)} // Slider needs 0-100
              onChange={handleTempChange}
              min={0}
              max={100}
              step={1}
              className="themed-slider p-mx-1" // Add margin
            />
            <span className="p-text-sm p-text-secondary p-ml-2">
              hallucinate=1
            </span>
          </div>
        </div>

        {/* Top-K */}
        <div className="p-field p-col-12 p-mb-4">
          <label htmlFor="topkSlider" className="param-label p-mb-2">
            No of Pages {k.toFixed(0)}
          </label>
          <div className="p-d-flex p-ai-center slider-container">
            <span className="p-text-sm p-text-secondary p-mr-2">0</span>
            <Slider
              id="topkSlider"
              ariaLabelledBy="label_topK"
              value={Math.round(k / 5)} // Map 0-500 to 0-100
              onChange={handleTopKChange}
              min={0}
              max={100}
              step={2} // Step corresponds to 10 in original range
              className="themed-slider p-mx-1"
            />
            <span className="p-text-sm p-text-secondary p-ml-2">500</span>
          </div>
        </div>

        {/* Top-P */}
        <div className="p-field p-col-12 p-mb-4">
          <label htmlFor="toppSlider" className="param-label p-mb-2">
            Strictness {p.toFixed(2)}
          </label>
          <div className="p-d-flex p-ai-center slider-container">
            <span className="p-text-sm p-text-secondary p-mr-2">0</span>
            <Slider
              id="toppSlider"
              ariaLabelledBy="label_topP"
              value={Math.round(p * 100)} // Slider 0-100
              onChange={handleTopPChange}
              min={0}
              max={100}
              step={1}
              className="themed-slider p-mx-1"
            />
            <span className="p-text-sm p-text-secondary p-ml-2">1</span>
          </div>
        </div>

        {/* Max Length */}
        <div className="p-field p-col-12 p-mb-4">
          <label htmlFor="maxlenSlider" className="param-label p-mb-2">
            Max length {maxLen.toFixed(0)}
          </label>
          <div className="p-d-flex p-ai-center slider-container">
            <span className="p-text-sm p-text-secondary p-mr-2">0</span>
            <Slider
              id="maxlenSlider"
              ariaLabelledBy="label_maxLength"
              value={Math.round(maxLen / 40.96)} // Map 0-4096 to 0-100
              onChange={handleMaxLengthChange}
              min={0}
              max={100}
              step={1} // Adjust step for desired granularity
              className="themed-slider p-mx-1"
            />
            <span className="p-text-sm p-text-secondary p-ml-2">4096</span>
          </div>
        </div>

        {/* Stop Sequence */}
        {/* <div className="p-field p-col-12">
                     <label className="param-label p-mb-2">Stop Sequence</label>
                     <div>
                         {stopSequences.map(seq => <Chip key={seq} label={seq} className="themed-chip p-mr-1"/>)} */}
        {/* Optional: Add InputText and Button to add/remove sequences */}
        {/* </div>
                  </div> */}
      </div>

      {/* --- Parameters Dialog Styling --- */}
      <style jsx global>{`
        /* Use theme variables defined in BackgorundFacts.js or globally */
        .parameters-dialog .p-dialog-header {
          background-color: var(--theme-muted-bg);
          border-bottom: 1px solid var(--theme-border);
        }
        .parameters-dialog .p-dialog-title {
          color: var(--theme-secondary);
          font-weight: 600;
        }
        .parameters-dialog .p-dialog-content {
          padding: 1.5rem;
        }
        .parameters-dialog .p-dialog-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--theme-border);
          background-color: var(--theme-muted-bg);
        }
        .parameters-dialog .dialog-footer {
          justify-content: space-between;
          display: flex;
          align-items: center;
        } /* Ensure footer buttons are spaced */

        .param-label {
          display: block;
          text-align: center;
          font-weight: 500;
          color: var(--theme-secondary);
          margin-bottom: 0.75rem !important;
          font-size: 0.95rem;
        }
        .param-label .param-value {
          font-weight: 600;
          color: var(--theme-primary);
        }
        .slider-container {
          margin-top: -0.5rem; /* Pull slider closer to label */
        }
        .themed-slider .p-slider-range {
          background: var(--theme-primary) !important;
        }
        .themed-slider .p-slider-handle {
          border-color: var(--theme-primary) !important;
          background: #fff !important;
          box-shadow: 0 0 0 2px var(--theme-primary);
          transition: box-shadow 0.2s;
        }
        .themed-slider .p-slider-handle:hover {
          box-shadow: 0 0 0 4px rgba(81, 23, 24, 0.3);
        } /* Use primary color with opacity */
        .p-slider {
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
          flex-grow: 1;
        } /* Allow slider to take space */
        .themed-chip.p-chip {
          background: var(--theme-muted-bg);
          color: var(--theme-secondary);
          border: 1px solid var(--theme-border);
          font-size: 0.9rem;
          padding: 0.25rem 0.75rem;
        }

        /* Adjust header style specifically */
        .params-dialog-header.p-dialog-header {
          background-color: var(--theme-panel-bg);
        } /* Lighter header */
        .params-dialog-header .p-dialog-title {
          color: var(--theme-primary);
        }
        .p-dialog .p-dialog-header .p-button-text {
          color: var(--theme-secondary) !important;
        } /* Reset icon color */
      `}</style>
    </Dialog>
  );
};

export default ParametersDialog;
