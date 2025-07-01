const { Queue, Worker } = require("bullmq");
const axios = require("axios");
const connection = require("../cbServices/redis/config");

const QUEUE_NAME = "groundTruthQueue";
const EXTRACTION_API_URL =
  "https://cytcmhlrg2hpzfjymbszuann3m0lmlvn.lambda-url.us-west-2.on.aws";

const groundTruthQueue = new Queue(QUEUE_NAME, {
  connection,
  prefix: `${process.env.PROJECT_NAME}:bull`,
});

const callInferenceAPI = async (jobId, payload) => {
  try {
    console.log(
      `[Worker ${jobId}] Sending request to API: ${EXTRACTION_API_URL}`,
    );
    const response = await axios.post(EXTRACTION_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 180000,
    });

    const apiResultContent = response?.data?.response_text || response?.data;
    if (
      !apiResultContent ||
      (typeof apiResultContent === "string" && apiResultContent.trim() === "")
    ) {
      console.warn(`[Worker ${jobId}] API returned empty or invalid content`);
      throw new Error("API returned empty or invalid content");
    }

    return typeof apiResultContent === "string"
      ? apiResultContent
      : JSON.stringify(apiResultContent);
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.message || "Unknown API error";
    console.error(`[Worker ${jobId}] Error during API call: ${errorMessage}`);
    throw new Error(`API failed: ${errorMessage}`);
  }
};

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

const handleInferenceGeneration = async (
  app,
  { caseDocumentId, summonsNo, jobId = "N/A", queueId, createdBy, updatedBy },
) => {
  if (!caseDocumentId || !summonsNo) {
    console.error(
      `[Worker ${jobId}] Missing required data: caseDocumentId=${caseDocumentId}, summonsNo=${summonsNo}`,
    );
    throw new Error("Missing required data: caseDocumentId or summonsNo");
  }

  // Fetch case document
  let extractedContent;
  try {
    const caseDoc = await app.service("caseDocuments").get(caseDocumentId);
    if (!caseDoc?.extractedContent) {
      console.error(
        `[Worker ${jobId}] Case document ${caseDocumentId} not found or missing extractedContent`,
      );
      throw new Error(
        `Case document ${caseDocumentId} not found or missing extractedContent`,
      );
    }
    extractedContent = caseDoc.extractedContent;
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching case document: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch case document ${caseDocumentId}: ${err.message}`,
    );
  }

  // Fetch synonyms and documentContent from accidentCases
  let synonymsData = [];
  let documentContent = [];
  try {
    const accidentCase = await app.service("accidentCases").get(summonsNo);
    if (!accidentCase) {
      console.error(
        `[Worker ${jobId}] No accidentCases record found for _id: ${summonsNo}`,
      );
      throw new Error(`No accidentCases record found for _id: ${summonsNo}`);
    }
    synonymsData = accidentCase.synonyms || [];
    documentContent = accidentCase.documentContent || [];
    console.log(
      `[Worker ${jobId}] Fetched ${synonymsData.length} synonyms and ${documentContent.length} documentContent entries for accidentCases _id: ${summonsNo}`,
    );
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching accidentCases for _id ${summonsNo}: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch accidentCases for _id ${summonsNo}: ${err.message}`,
    );
  }

  // Fetch all llmPrompts
  let llmPrompts = [];
  try {
    const result = await app.service("llmPromptCalls").find({
      query: {},
    });
    llmPrompts = result.data || [];
    if (!llmPrompts.length) {
      console.warn(
        `[Worker ${jobId}] No llmPrompts records found in the database, proceeding with empty prompt list`,
      );
    }
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching llmPrompts: ${err.message}`,
    );
    throw new Error(`Failed to fetch llmPrompts: ${err.message}`);
  }

  const userId = createdBy || updatedBy || "67eea6f8dfc548354ff6b9d1";
  const results = [];

  // Process each llmPrompt
  if (llmPrompts.length === 0) {
    console.log(
      `[Worker ${jobId}] No llmPrompts to process, marking job as completed with no actions`,
    );
    results.push({
      section: "N/A",
      subsection: "N/A",
      status: "completed",
      message: "No llmPrompts available to process",
    });
  } else {
    for (let i = 0; i < llmPrompts.length; i++) {
      const prompt = llmPrompts[i];
      const { _id, section, subsection, content, order = i + 1 } = prompt;

      if (!section || !subsection || !content) {
        console.warn(
          `[Worker ${jobId}] Skipping invalid llmPrompt record: ${_id} (missing section, subsection, or content)`,
        );
        results.push({
          section: section || "unknown",
          subsection: subsection || "unknown",
          status: "skipped",
          error: "Missing section, subsection, or content",
        });
        continue;
      }

      // Prepare API payload
      let apiPayload = { ...content };
      if (apiPayload.documents && Array.isArray(apiPayload.documents)) {
        apiPayload.documents = documentContent.map((doc) => ({
          content: doc.content || extractedContent,
          filepath: doc.filepath,
          filename: doc.filename,
        }));
      }
      apiPayload.synonymous = synonymsData.map((item) => ({
        primary: item.primary,
        synonyms: item.synonymsList.join(", "),
      }));

      // Derive promptUsed
      const promptUsed = content.question || content.human || "";

      // Call API
      let groundTruthText;
      try {
        groundTruthText = await callInferenceAPI(jobId, apiPayload);
        console.log(
          `[Worker ${jobId}] Ground truth content for ${section}/${subsection} (length: ${groundTruthText.length})`,
        );
      } catch (err) {
        console.error(
          `[Worker ${jobId}] Failed to process llmPrompt ${_id}: ${err.message}`,
        );
        results.push({
          section,
          subsection,
          status: "failed",
          error: err.message,
        });
        continue;
      }

      // Split the API response into initialInference and retrievedFrom
      const { initialInference, retrievedFrom } =
        splitApiResponse(groundTruthText);

      // Create sectionContents record with llmPrompts ObjectId
      try {
        await app.service("sectionContents").create({
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
          llmPrompts: _id, // Assign the ObjectId from llmPromptCalls
          createdBy: userId,
          updatedBy: userId,
        });
        console.log(
          `[Worker ${jobId}] Created section_contents record for ${section}/${subsection}, caseDocumentId: ${caseDocumentId}, summonsNo: ${summonsNo}, llmPrompts: ${_id}`,
        );
        results.push({ section, subsection, status: "completed" });
      } catch (err) {
        console.error(
          `[Worker ${jobId}] Error creating section_contents for ${section}/${subsection}: ${err.message}`,
        );
        results.push({
          section,
          subsection,
          status: "failed",
          error: err.message,
        });
      }
    }
  }

  // Update queue status
  try {
    if (queueId) {
      await app.service("groundTruthQueues").patch(queueId, {
        status: results.every((r) => r.status === "completed")
          ? "completed"
          : "failed",
        updatedAt: new Date(),
        errorMessage: results
          .filter((r) => r.status !== "completed")
          .map(
            (r) =>
              `Failed ${r.section}/${r.subsection}: ${r.error || r.message}`,
          )
          .join("; "),
      });
      console.log(`[Worker ${jobId}] Updated queue status for job ${queueId}`);
    }

    return { status: "completed", caseDocumentId, results };
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error updating queue ${caseDocumentId}: ${err.message}`,
    );
    throw new Error(`Failed to update queue ${caseDocumentId}: ${err.message}`);
  }
};

const createInferenceWorker = (app) => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const jobData = { ...job.data, jobId: job.id, queueId: job.data._id };
      try {
        const result = await handleInferenceGeneration(app, jobData);
        console.log(
          `[Worker ${job.id}] Successfully processed job for CaseDoc ${jobData.caseDocumentId}`,
        );
        return result;
      } catch (err) {
        console.error(`[Worker ${job.id}] Job failed: ${err.message}`);
        if (jobData._id) {
          try {
            await app.service("groundTruthQueues").patch(jobData._id, {
              status: "failed",
              errorMessage: err.message,
              updatedAt: new Date(),
            });
            console.log(
              `[Worker ${job.id}] Updated queue status to failed for job ${jobData._id}`,
            );
          } catch (queueErr) {
            console.error(
              `[Worker ${job.id}] Failed to update queue status: ${queueErr.message}`,
            );
          }
        }
        throw err;
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: { max: 10, duration: 60000 },
      lockDuration: 300000,
      prefix: `${process.env.PROJECT_NAME}:bull`,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker ${job.id}] Failed job for CaseDoc ${job.data?.caseDocumentId}: ${err.message}`,
    );
  });

  worker.on("completed", (job) => {
    console.log(
      `[Worker ${job.id}] Completed job for CaseDoc ${job.data?.caseDocumentId}`,
    );
  });

  const groundTruthService = app.service("groundTruthQueues");
  groundTruthService.hooks({
    before: {
      create: async (context) => {
        const { caseDocumentId, summonsNo } = context.data;
        if (!summonsNo) {
          throw new Error("summonsNo is required for groundTruthQueues");
        }
        const existing = await app.service("groundTruthQueues").find({
          query: { caseDocumentId, status: { $in: ["queued", "processing"] } },
        });
        if (existing.total > 0) {
          throw new Error(
            `Queue entry already exists for caseDocumentId: ${caseDocumentId}`,
          );
        }
        return context;
      },
    },
    after: {
      create: async (context) => {
        const { result } = context;
        if (result.caseDocumentId && result.summonsNo) {
          await groundTruthQueue.add("groundTruth", result);
          console.log(
            `[Queue] Added ground truth job for CaseDoc ${result.caseDocumentId} with summonsNo: ${result.summonsNo}`,
          );
        }
        return context;
      },
    },
  });

  return worker;
};

module.exports = { createInferenceWorker, groundTruthQueue };
