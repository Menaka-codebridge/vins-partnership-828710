const axios = require("axios");
const { getEncoding } = require("js-tiktoken");

let encoding;

try {
  encoding = getEncoding("cl100k_base");
  console.log("js-tiktoken initialized successfully");
} catch (err) {
  console.error("Failed to initialize js-tiktoken:", err.message);
  encoding = {
    encode: (text) => {
      return new Array(Math.ceil(text.length / 4));
    },
  };
}

const EXTRACTION_API_URL = process.env.LLM_CLASS3;

const splitApiResponse = (text) => {
  const paragraphs = text.split(/\n\s*\n/);
  let splitIndex = -1;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (paragraph.match(/^(Relevant Extracts|Citation):?/i)) {
      splitIndex = i;
      break;
    }
  }

  if (splitIndex === -1) {
    return {
      initialInference: text.trim(),
      retrievedFrom: "No relevant extracts or citations available",
    };
  }

  const initialInference = paragraphs.slice(0, splitIndex).join("\n\n").trim();
  const retrievedFrom = paragraphs.slice(splitIndex).join("\n\n").trim();

  return {
    initialInference: initialInference || "No inference content available",
    retrievedFrom:
      retrievedFrom || "No relevant extracts or citations available",
  };
};

const calculateTokens = (payload, responseText) => {
  // Serialize payload to string for token counting
  let inputText = "";
  if (payload.human) inputText += payload.human + "\n";
  if (payload.documents && Array.isArray(payload.documents)) {
    payload.documents.forEach((doc) => {
      if (doc.content) inputText += `<document>${doc.content}</document>\n`;
    });
  }
  if (payload.task) inputText += payload.task + "\n";
  if (payload.noCondition) inputText += payload.noCondition + "\n";
  if (payload.yesCondition) inputText += payload.yesCondition + "\n";
  if (payload.format) inputText += payload.format + "\n";
  if (payload.example && Array.isArray(payload.example)) {
    inputText += payload.example.join("\n") + "\n";
  }
  if (payload.preamble) inputText += payload.preamble + "\n";

  const inputTokens = encoding.encode(inputText).length;
  const outputTokens = responseText ? encoding.encode(responseText).length : 0;
  const totalTokens = inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
};

const promiseSectionSubSectionFunctionCall = (
  app,
  jobId,
  apiPayload,
  summonsNo,
  section,
  subsection,
  promptUsed,
  llmId,
  userId,
  order,
  caseDocumentId,
) => {
  return app
    .service("sectionContents")
    .find({
      query: {
        summonsNo,
        section,
        subsection,
      },
    })
    .then((existing) => {
      if (existing.total > 0) {
        console.log(
          `[Worker ${jobId}] sectionContents already exists for ${section}/${subsection}, summonsNo: ${summonsNo}, skipping creation`,
        );
        return {
          section,
          subsection,
          status: "skipped",
          message: "sectionContents already exists",
        };
      }

      // Filter out invalid document content
      if (apiPayload.documents && Array.isArray(apiPayload.documents)) {
        apiPayload.documents = apiPayload.documents.filter(
          (doc) =>
            doc.content &&
            !doc.content.includes("I apologize, but the provided S3 URL"),
        );
        if (apiPayload.documents.length === 0) {
          console.warn(
            `[Worker ${jobId}] No valid documents for ${section}/${subsection}, skipping API call`,
          );
          throw new Error("No valid document content available for API call");
        }
      }

      // Retry logic for API call
      const retryAxios = async (payload, maxRetries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await axios.post(EXTRACTION_API_URL, payload, {
              headers: { "Content-Type": "application/json" },
              timeout: 80000,
            });
            return response;
          } catch (err) {
            if (err.response && [502, 503].includes(err.response.status)) {
              console.log(
                `[Worker ${jobId}] Retry attempt ${attempt} for API call: ${err.message}`,
              );
              if (attempt === maxRetries) throw err;
              await new Promise((resolve) =>
                setTimeout(resolve, delay * attempt),
              );
            } else {
              throw err;
            }
          }
        }
      };

      return retryAxios(apiPayload)
        .then(async (response) => {
          const apiResultContent =
            response?.data?.response_text || response?.data;
          if (
            !apiResultContent ||
            (typeof apiResultContent === "string" &&
              apiResultContent.trim() === "")
          ) {
            console.warn(
              `[Worker ${jobId}] API returned empty or invalid content`,
            );
            throw new Error("API returned empty or invalid content");
          }

          // Calculate token counts
          const { inputTokens, outputTokens, totalTokens } = calculateTokens(
            apiPayload,
            apiResultContent,
          );
          console.log(
            `[Worker ${jobId}] Token counts for ${section}/${subsection}: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}`,
          );

          const groundTruthText =
            typeof apiResultContent === "string"
              ? apiResultContent
              : JSON.stringify(apiResultContent);
          const { initialInference, retrievedFrom } =
            splitApiResponse(groundTruthText);

          // Create sectionContents record
          const sectionContent = await app.service("sectionContents").create({
            summonsNo,
            section,
            subsection,
            order,
            initialInference,
            inferenceStatement: "",
            groundTruth: "",
            retrievedFrom,
            promptUsed,
            confusionMatrix: "",
            conclusion: "",
            status: "Draft",
            llmPrompts: llmId,
            createdBy: userId,
            updatedBy: userId,
          });
          console.log("sectionContent data: ", sectionContent);
          // Store token usage
          await app.service("tokenUsage").create({
            jobId,
            sectionContentId: sectionContent._id,
            summonsNo,
            section,
            subsection,
            inputTokens,
            outputTokens,
            totalTokens,
            createdBy: userId,
            updatedBy: userId,
          });

          console.log(
            `[Worker ${jobId}] Created section_contents record for ${section}/${subsection}, caseDocumentId: ${caseDocumentId}, summonsNo: ${summonsNo}, llmPrompts: ${llmId}`,
          );
          return { section, subsection, status: "completed" };
        })
        .catch((err) => {
          const errorMessage =
            err.response?.data?.error || err.message || "Unknown API error";
          console.error(
            `[Worker ${jobId}] Error during API call: ${errorMessage}`,
          );
          if (err.response) {
            console.error(
              `[Worker ${jobId}] Error Response Details:`,
              JSON.stringify(err.response.data, null, 2),
            );
            console.error(
              `[Worker ${jobId}] Error Status: ${err.response.status}`,
            );
          }
          throw new Error(
            `Extraction API failed for job ${jobId}: ${errorMessage}`,
          );
        });
    });
};

module.exports = { promiseSectionSubSectionFunctionCall };
