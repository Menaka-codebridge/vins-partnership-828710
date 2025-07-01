
import React from "react";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  Header,
  Footer,
  PageNumber,
  ImageRun,
} from "docx";

// Normalize value keys (lowercase, no spaces)
const normalizeKey = (value) => value.toLowerCase().replace(/\s/g, "");

// Remove citations (e.g., ¹, ², [1], [2]) from text
const removeCitations = (text) => {
  if (!text) return text;
  return text.replace(/[\u00B9-\u00BF]+|\[\d+\]/g, "").trim();
};

const LegalDocumentWord = ({ accidentCase, allSections }) => {
  // Log props for debugging
  console.log("LegalDocumentWord Props:", { accidentCase, allSections });

  // Extract data from accidentCase for references table
  const insuranceRef = accidentCase?.insuranceRef || "No content available";
  const vinsPartnershipReference =
    accidentCase?.vinsPartnershipReference || "No content available";
  const summonsNo = accidentCase?.summonsNo || "No content available";
  const court = accidentCase?.court || "No content available";
  const plaintiffSolicitors =
    accidentCase?.plaintiffSolicitors || "No content available";
  const plaintiff = accidentCase?.plaintiff || "No content available";
  const insuredDriver = accidentCase?.insuredDriver || "No content available";
  const insured = accidentCase?.insured || "No content available";
  const insuredVehicle = accidentCase?.insuredVehicle || "No content available";
  const collisionDateTime = accidentCase?.collisionDateTime
    ? new Date(accidentCase.collisionDateTime).toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No content available";
  const claimStatus = accidentCase?.claimStatus || "No content available";
  const claimStatusDate = accidentCase?.claimStatusDate
    ? new Date(accidentCase.claimStatusDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No content available";
  const claimStatusDateFormatted = accidentCase?.claimStatusDate
    ? new Date(accidentCase.claimStatusDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, ".")
    : "No content available";
  const recipientDepartment = accidentCase?.recipientDepartment || "No content available";
  const recipientName = accidentCase?.recipientName || "No content available";

  // Split recipientDepartment by commas for display
  const recipientParts = recipientDepartment.split(",").map(part => part.trim());

  // Get current date formatted as "DD Month YYYY"
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Dynamically map allSections to subsections with citations removed
  const subsections = {};
  allSections.forEach((section) => {
    const sectionKey = normalizeKey(section.value);
    if (
      section.subSections.length === 1 &&
      section.value.toLowerCase() === section.subSections[0].value.toLowerCase()
    ) {
      subsections[sectionKey] = removeCitations(
        section.subSections[0].groundTruth ||
          "No content for this section available"
      );
    } else {
      subsections[sectionKey] = {};
      section.subSections.forEach((subSection) => {
        const subSectionKey = normalizeKey(subSection.value);
        subsections[sectionKey][subSectionKey] = removeCitations(
          subSection.groundTruth || "No content for this section available"
        );
      });
    }
  });

  // Extract Estimate from Conclusion infer statement
  let estimate = "No content available";
  let conclusionItems = [];
  if (subsections.conclusion) {
    const conclusionMatch = subsections.conclusion.match(/TOTAL\s*RM\s*([\d,.]+)/i);
    if (conclusionMatch) {
      estimate = `RM ${conclusionMatch[1]}`;
    }
    // Parse conclusion for damages items, excluding citations
    const itemMatches = subsections.conclusion.matchAll(
      /(i{1,3}\.\s*[^:]+?)\s*(RM\s*[\d,.]+|No relevant information found)/g
    );
    for (const match of itemMatches) {
      conclusionItems.push({
        label: match[1].trim(),
        value: match[2].trim(),
      });
    }
  }

  // Extract Liability percentage from Opinion on Liability infer statement
  let liability = "No content available";
  if (subsections.liability?.opiniononliability) {
    const liabilityMatch = subsections.liability.opiniononliability.match(/(\d+)%\s*liable/i);
    if (liabilityMatch) {
      liability = `${liabilityMatch[1]}%`;
    }
  }

  // Calculate Quantum on (100%) as Estimate * Liability
  let quantum = "No content available";
  if (estimate !== "No content available" && liability !== "No content available") {
    const estimateValue = parseFloat(estimate.replace(/RM\s*|,|/g, ""));
    const liabilityValue = parseFloat(liability.replace(/%/g, "")) / 100;
    const quantumValue = estimateValue * liabilityValue;
    quantum = `RM ${quantumValue.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Log subsections and extracted values for debugging
  console.log("Mapped Subsections:", subsections);
  console.log("Extracted Values:", { estimate, liability, quantum, conclusionItems });

  // Static data from sample PDF
  const confidential = "PRIVATE & CONFIDENTIAL BY EMAIL";
  const footerAddress =
    "1311, Level 13, Block B, Phileo Damansara 2, 15, Jalan 16/11, Off Jalan Damansara, 46350 Petaling Jaya, Selangor, Malaysia";
  const footerContact =
    "03 77 88 0000 | 03 77 88 0001 | office@vinpartnership.my";

  // References table using direct accidentCase fields and extracted values
  const references = [
    { label: "AMG Reference", value: insuranceRef },
    { label: "Vin Partnership Reference", value: vinsPartnershipReference },
    { label: "Summons No.", value: summonsNo },
    { label: "Court", value: court },
    { label: "Plaintiff's Solicitors", value: plaintiffSolicitors },
    { label: "Plaintiff", value: plaintiff },
    { label: "Insured Driver", value: insuredDriver },
    { label: "Insured", value: insured },
    { label: "Insured Vehicle", value: insuredVehicle },
    { label: "Date and Time of Collision", value: collisionDateTime },
    { label: "Status of Claim", value: `${claimStatus} (${claimStatusDate})` },
    { label: "Estimate", value: estimate },
    { label: "Liability", value: liability },
    { label: "Quantum on (100%)", value: quantum },
  ];

  // Helper function for references table rows
  const createTableRow = (label, value) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: label, size: 18, bold: true })],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
          shading: { fill: "F2F2F2" },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: value, size: 18 })],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });
  };

  // Helper function for conclusion table rows
  const createConclusionTableRow = (label, value, isTotal = false) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  size: 18,
                  bold: isTotal,
                }),
              ],
            }),
          ],
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  size: 18,
                  bold: isTotal,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });
  };

  // Footer configuration
  const createFooter = () =>
    new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: footerAddress, size: 14 }),
            new TextRun({ text: " | Page " }),
            new TextRun({ text: PageNumber.CURRENT, size: 14 }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { before: 100 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "C0C0C0" },
          },
        }),
        new Paragraph({
          children: [new TextRun({ text: footerContact, size: 14 })],
          alignment: AlignmentType.LEFT,
        }),
      ],
    });

  // Section mappings to match sample PDF
  const sectionOrder = [
    { key: "status", label: "A. STATUS" },
    {
      key: "backgroundandfacts",
      label: "B. BACKGROUND FACTS",
      subSections: [
        { key: "policereports", label: "REPORTS IN ORDER OF DATE/TIME" },
        { key: "sketchplan", label: "SKETCH PLAN" },
        { key: "policephotographs", label: "POLICE PHOTOGRAPHS" },
        { key: "policefindings", label: "POLICE FINDINGS" },
        { key: "adjustersreports", label: "ADJUSTER'S REPORT" },
      ],
    },
    {
      key: "liability",
      label: "C. LIABILITY",
      subSections: [{ key: "opiniononliability", label: "Opinion on Liability" }],
    },
    { key: "liabilityfraud", label: "D. LIABILITY FRAUD" },
    {
      key: "quantum",
      label: "E. QUANTUM",
      subSections: [
        { key: "generaldamages", label: "General Damages" },
        { key: "futuretreatments", label: "Cost of Future Treatments" },
        { key: "specialdamages", label: "Special Damages" },
        { key: "lossofearnings", label: "Loss of Earnings" },
      ],
    },
    { key: "strategy", label: "F. STRATEGY" },
    { key: "conclusion", label: "G. CONCLUSION" },
  ];

  const data = {
    HeaderSrc: "../../assets/logo/vinsHeader.png",
    footerSrc: "../../assets/logo/vinsFooter.png",
  };

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        // headers: {
        //   default: new Header({
        //     children: [
        //       new Paragraph({
        //         children: [
        //           new ImageRun({
        //             data: data.HeaderSrc,
        //             transformation: { width: 600, height: 100 },
        //           }),
        //         ],
        //         alignment: AlignmentType.CENTER,
        //         spacing: { after: 200 },
        //       }),
        //     ],
        //   }),
        // },
        // footers: { default: createFooter() },
        children: [
          ...recipientParts.map(part => (
            new Paragraph({
              children: [new TextRun({ text: part, size: 18 })],
              spacing: { after: 20 },
            })
          )),
          new Paragraph({
            children: [new TextRun({ text: confidential, size: 18, bold: true })],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [new TextRun({ text: currentDate, size: 18 })],
            alignment: AlignmentType.LEFT,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Dear Ms ${recipientName},`, size: 18 })],
            spacing: { after: 300 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: references.map((ref) => createTableRow(ref.label, ref.value)),
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "We refer to the above matter.", size: 18 }),
            ],
            spacing: { before: 200, after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "We are pleased to append our Legal Opinion in this matter for your kind consideration.",
                size: 18,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "A. STATUS",
                size: 20,
                bold: true,
                underline: { type: "SINGLE" },
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Please note that the abovementioned matter has been fixed for ${claimStatus} on ${claimStatusDateFormatted}.`,
                size: 18,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          }),
        ],
      },
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        footers: { default: createFooter() },
        children: subsections.backgroundandfacts
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "B. BACKGROUND FACTS",
                    size: 20,
                    bold: true,
                    underline: { type: "SINGLE" },
                  }),
                ],
                spacing: { after: 200 },
              }),
              subsections.backgroundandfacts.policereports &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "REPORTS IN ORDER OF DATE/TIME",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.backgroundandfacts.policereports &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.backgroundandfacts.policereports,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.backgroundandfacts.sketchplan &&
                new Paragraph({
                  children: [
                    new TextRun({ text: "SKETCH PLAN", size: 18, bold: true }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.backgroundandfacts.sketchplan &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.backgroundandfacts.sketchplan,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.backgroundandfacts.policephotographs &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "POLICE PHOTOGRAPHS",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.backgroundandfacts.policephotographs &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.backgroundandfacts.policephotographs,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.backgroundandfacts.policefindings &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "POLICE FINDINGS",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.backgroundandfacts.policefindings &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.backgroundandfacts.policefindings,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.backgroundandfacts.adjustersreports &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "ADJUSTER'S REPORT",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.backgroundandfacts.adjustersreports &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.backgroundandfacts.adjustersreports,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
            ]
          : [],
      },
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        footers: { default: createFooter() },
        children: [
          subsections.liability &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "C. LIABILITY",
                  size: 20,
                  bold: true,
                  underline: { type: "SINGLE" },
                }),
              ],
              spacing: { after: 200 },
            }),
          subsections.liability?.opiniononliability &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "Opinion on Liability",
                  size: 18,
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
          subsections.liability?.opiniononliability &&
            new Paragraph({
              children: [
                new TextRun({
                  text: subsections.liability.opiniononliability,
                  size: 18,
                }),
              ],
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          subsections.liabilityfraud &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "D. LIABILITY FRAUD",
                  size: 20,
                  bold: true,
                  underline: { type: "SINGLE" },
                }),
              ],
              spacing: { after: 200 },
            }),
          subsections.liabilityfraud &&
            new Paragraph({
              children: [
                new TextRun({ text: subsections.liabilityfraud, size: 18 }),
              ],
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED,
            }),
        ],
      },
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        footers: { default: createFooter() },
        children: subsections.quantum
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "E. QUANTUM",
                    size: 20,
                    bold: true,
                    underline: { type: "SINGLE" },
                  }),
                ],
                spacing: { after: 200 },
              }),
              subsections.quantum.generaldamages &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "General Damages",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.quantum.generaldamages &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.quantum.generaldamages,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.quantum.futuretreatments &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Cost of Future Treatments",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.quantum.futuretreatments &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.quantum.futuretreatments,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.quantum.specialdamages &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Special Damages",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.quantum.specialdamages &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.quantum.specialdamages,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
              subsections.quantum.lossofearnings &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Loss of Earnings",
                      size: 18,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              subsections.quantum.lossofearnings &&
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsections.quantum.lossofearnings,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
            ]
          : [],
      },
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        footers: { default: createFooter() },
        children: [
          subsections.strategy &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "F. STRATEGY",
                  size: 20,
                  bold: true,
                  underline: { type: "SINGLE" },
                }),
              ],
              spacing: { after: 200 },
            }),
          subsections.strategy &&
            new Paragraph({
              children: [new TextRun({ text: subsections.strategy, size: 18 })],
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          subsections.conclusion &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "G. CONCLUSION",
                  size: 20,
                  bold: true,
                  underline: { type: "SINGLE" },
                }),
              ],
              spacing: { after: 200 },
            }),
          subsections.conclusion &&
            new Paragraph({
              children: [
                new TextRun({
                  text: "Damages (on 100% basis) will therefore total:",
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          subsections.conclusion &&
            new Table({
              width: { size: 50, type: WidthType.PERCENTAGE },
              rows: [
                ...conclusionItems.map((item) =>
                  createConclusionTableRow(item.label, item.value)
                ),
                createConclusionTableRow("TOTAL", estimate, true),
              ],
            }),
          new Paragraph({
            children: [new TextRun({ text: "Yours faithfully,", size: 18 })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "VIN PARTNERSHIP", size: 18, bold: true }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });
};

export default LegalDocumentWord;
