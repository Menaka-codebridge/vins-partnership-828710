import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  pageFirst: {
    paddingTop: 20,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  HeaderImage: {
    width: "100%",
    marginBottom: 20,
  },
  recipientInfo: {
    marginBottom: 15,
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 10,
  },
  recipientText: {
    fontSize: 9,
    marginBottom: 1,
  },
  dateAndConfidential: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  confidentialText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 9,
  },
  section: {
    marginBottom: 10,
  },
  mainHeader: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textDecoration: "underline",
  },
  subHeader: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "35%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f2f2f2",
    padding: 5,
  },
  tableCol: {
    width: "65%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 9,
  },
  conclusionTable: {
    display: "flex",
    width: "50%",
    marginBottom: 10,
    marginTop: 5,
  },
  conclusionTableRow: {
    flexDirection: "row",
  },
  conclusionTableColLabel: {
    width: "70%",
    padding: 3,
  },
  conclusionTableColValue: {
    width: "30%",
    padding: 3,
    textAlign: "right",
  },
  conclusionTableCell: {
    fontSize: 9,
  },
  conclusionTableTotalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    padding: 3,
  },
  conclusionTableTotalValue: {
    fontSize: 9,
    fontWeight: "bold",
    padding: 3,
    textAlign: "right",
  },
  text: {
    fontSize: 9,
    marginBottom: 5,
    textAlign: "justify",
    lineHeight: 1.3,
  },
  footerContainerFirst: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerImage: {
    width: "100%",
    height: "auto",
  },
  footerContainerRest: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    fontSize: 8,
    color: "grey",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#c0c0c0",
    paddingTop: 5,
  },
  footerAddress: {
    fontSize: 7,
    textAlign: "left",
    color: "black",
    maxWidth: "70%",
  },
  pageNumber: {
    fontSize: 9,
    textAlign: "right",
  },
});

// Normalize value keys (lowercase, no spaces)
const normalizeKey = (value) => value.toLowerCase().replace(/\s/g, "");

const LegalDocument = ({ accidentCase, allSections }) => {
  // Log props for debugging
  console.log("LegalDocument Props:", { accidentCase, allSections });

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
    ? new Date(accidentCase.claimStatusDate)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".")
    : "No content available";
  const recipientDepartment =
    accidentCase?.recipientDepartment || "No content available";
  const recipientName = accidentCase?.recipientName || "No content available";

  // Split recipientDepartment by commas for display
  const recipientParts = recipientDepartment
    .split(",")
    .map((part) => part.trim());

  // Get current date formatted as "DD Month YYYY"
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Dynamically map allSections to subsections
  const subsections = {};
  allSections.forEach((section) => {
    const sectionKey = normalizeKey(section.value);
    if (
      section.subSections.length === 1 &&
      section.value.toLowerCase() === section.subSections[0].value.toLowerCase()
    ) {
      subsections[sectionKey] =
        section.subSections[0].groundTruth ||
        "No content for this section available";
    } else {
      subsections[sectionKey] = {};
      section.subSections.forEach((subSection) => {
        const subSectionKey = normalizeKey(subSection.value);
        subsections[sectionKey][subSectionKey] =
          subSection.groundTruth || "No content for this section available";
      });
    }
  });

  // Extract Estimate from Conclusion infer statement
  let estimate = "No content available";
  let conclusionItems = [];
  if (subsections.conclusion) {
    const conclusionMatch = subsections.conclusion.match(
      /TOTAL\s*RM\s*([\d,.]+)/i,
    );
    if (conclusionMatch) {
      estimate = `RM ${conclusionMatch[1]}`;
    }
    // Parse conclusion for damages items
    const itemMatches = subsections.conclusion.matchAll(
      /(i{1,3}\.\s*[^:]+?)\s*(RM\s*[\d,.]+|No relevant information found)\s*\[\d+\]/g,
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
    const liabilityMatch =
      subsections.liability.opiniononliability.match(/(\d+)%\s*liable/i);
    if (liabilityMatch) {
      liability = `${liabilityMatch[1]}%`;
    }
  }

  // Calculate Quantum on (100%) as Estimate * Liability
  let quantum = "No content available";
  if (
    estimate !== "No content available" &&
    liability !== "No content available"
  ) {
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
  console.log("Extracted Values:", {
    estimate,
    liability,
    quantum,
    conclusionItems,
  });

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

  // Section mappings to match sample PDF (excluding Confusion Matrix)
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
      subSections: [
        { key: "opiniononliability", label: "Opinion on Liability" },
      ],
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

  return (
    <Document>
      <Page size="A4" style={styles.pageFirst}>
        <Image style={styles.HeaderImage} src={data.HeaderSrc} />
        <View style={styles.recipientInfo}>
          {recipientParts.map((part, index) => (
            <Text key={index} style={styles.recipientText}>
              {part}
            </Text>
          ))}
        </View>
        <View style={styles.dateAndConfidential}>
          <Text style={styles.confidentialText}>{confidential}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientText}>Dear Ms {recipientName},</Text>
        </View>
        <View style={styles.table}>
          {references.map((ref, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>{ref.label}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{ref.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.text}>We refer to the above matter.</Text>
        <Text style={styles.text}>
          We are pleased to append our Legal Opinion in this matter for your
          kind consideration.
        </Text>
        <Text style={styles.mainHeader}>A. STATUS</Text>
        <Text style={styles.text}>
          Please note that the abovementioned matter has been fixed for{" "}
          {claimStatus} on {claimStatusDateFormatted}.
        </Text>
        <View style={styles.footerContainerFirst} fixed>
          <Image style={styles.footerImage} src={data.footerSrc} />
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        {subsections.backgroundandfacts && (
          <>
            <Text style={styles.mainHeader}>B. BACKGROUND FACTS</Text>
            {subsections.backgroundandfacts.policereports && (
              <>
                <Text style={styles.subHeader}>
                  REPORTS IN ORDER OF DATE/TIME
                </Text>
                <Text style={styles.text}>
                  {subsections.backgroundandfacts.policereports}
                </Text>
              </>
            )}
            {subsections.backgroundandfacts.sketchplan && (
              <>
                <Text style={styles.subHeader}>SKETCH PLAN</Text>
                <Text style={styles.text}>
                  {subsections.backgroundandfacts.sketchplan}
                </Text>
              </>
            )}
            {subsections.backgroundandfacts.policephotographs && (
              <>
                <Text style={styles.subHeader}>POLICE PHOTOGRAPHS</Text>
                <Text style={styles.text}>
                  {subsections.backgroundandfacts.policephotographs}
                </Text>
              </>
            )}
            {subsections.backgroundandfacts.policefindings && (
              <>
                <Text style={styles.subHeader}>POLICE FINDINGS</Text>
                <Text style={styles.text}>
                  {subsections.backgroundandfacts.policefindings}
                </Text>
              </>
            )}
            {subsections.backgroundandfacts.adjustersreports && (
              <>
                <Text style={styles.subHeader}>ADJUSTER'S REPORT</Text>
                <Text style={styles.text}>
                  {subsections.backgroundandfacts.adjustersreports}
                </Text>
              </>
            )}
          </>
        )}
        <View style={styles.footerContainerRest} fixed>
          <Text style={styles.footerAddress}>{footerAddress}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
          />
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        {subsections.liability && (
          <>
            <Text style={styles.mainHeader}>C. LIABILITY</Text>
            {subsections.liability.opiniononliability && (
              <>
                <Text style={styles.subHeader}>Opinion on Liability</Text>
                <Text style={styles.text}>
                  {subsections.liability.opiniononliability}
                </Text>
              </>
            )}
          </>
        )}
        {subsections.liabilityfraud && (
          <>
            <Text style={styles.mainHeader}>D. LIABILITY FRAUD</Text>
            <Text style={styles.text}>{subsections.liabilityfraud}</Text>
          </>
        )}
        <View style={styles.footerContainerRest} fixed>
          <Text style={styles.footerAddress}>{footerAddress}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
          />
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        {subsections.quantum && (
          <>
            <Text style={styles.mainHeader}>E. QUANTUM</Text>
            {subsections.quantum.generaldamages && (
              <>
                <Text style={styles.subHeader}>General Damages</Text>
                <Text style={styles.text}>
                  {subsections.quantum.generaldamages}
                </Text>
              </>
            )}
            {subsections.quantum.futuretreatments && (
              <>
                <Text style={styles.subHeader}>Cost of Future Treatments</Text>
                <Text style={styles.text}>
                  {subsections.quantum.futuretreatments}
                </Text>
              </>
            )}
            {subsections.quantum.specialdamages && (
              <>
                <Text style={styles.subHeader}>Special Damages</Text>
                <Text style={styles.text}>
                  {subsections.quantum.specialdamages}
                </Text>
              </>
            )}
            {subsections.quantum.lossofearnings && (
              <>
                <Text style={styles.subHeader}>Loss of Earnings</Text>
                <Text style={styles.text}>
                  {subsections.quantum.lossofearnings}
                </Text>
              </>
            )}
          </>
        )}
        <View style={styles.footerContainerRest} fixed>
          <Text style={styles.footerAddress}>{footerAddress}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
          />
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        {subsections.strategy && (
          <>
            <Text style={styles.mainHeader}>F. STRATEGY</Text>
            <Text style={styles.text}>{subsections.strategy}</Text>
          </>
        )}
        {subsections.conclusion && (
          <>
            <Text style={styles.mainHeader}>G. CONCLUSION</Text>
            <Text style={styles.text}>
              Damages (on 100% basis) will therefore total:
            </Text>
            <View style={styles.conclusionTable}>
              {conclusionItems.map((item, index) => (
                <View key={index} style={styles.conclusionTableRow}>
                  <View style={styles.conclusionTableColLabel}>
                    <Text style={styles.conclusionTableCell}>{item.label}</Text>
                  </View>
                  <View style={styles.conclusionTableColValue}>
                    <Text style={styles.conclusionTableCell}>{item.value}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.conclusionTableRow}>
                <View style={styles.conclusionTableColLabel}>
                  <Text style={styles.conclusionTableTotalLabel}>TOTAL</Text>
                </View>
                <View style={styles.conclusionTableColValue}>
                  <Text style={styles.conclusionTableTotalValue}>
                    {estimate}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
        {subsections.confusionmatrix && (
          <>
            <Text style={styles.mainHeader}>H. CONFUSION MATRIX</Text>
            <Text style={styles.text}>{subsections.confusionmatrix}</Text>
          </>
        )}
        <Text style={[styles.text, { marginTop: 20 }]}>Yours faithfully,</Text>
        <Text style={[styles.text, { bold: true }]}>VIN PARTNERSHIP</Text>
        <View style={styles.footerContainerRest} fixed>
          <Text style={styles.footerAddress}>{footerAddress}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default LegalDocument;
