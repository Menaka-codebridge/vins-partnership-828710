const { Queue, Worker } = require("bullmq");
const axios = require("axios");
const connection = require("../cbServices/redis/config");

const QUEUE_NAME = "textExtractionQueue";
const EXTRACTION_API_URL =
  "https://cytcmhlrg2hpzfjymbszuann3m0lmlvn.lambda-url.us-west-2.on.aws";

const textExtractionQueue = new Queue(QUEUE_NAME, {
  connection,
  prefix: `${process.env.PROJECT_NAME}:bull`,
});

const handleTextExtraction = async (
  app,
  {
    caseDocumentId,
    documentStorageId,
    documentType,
    summonsNo,
    jobId = "N/A",
    queueId,
    createdBy,
    updatedBy,
  },
) => {
  if (!caseDocumentId || !documentStorageId || !summonsNo) {
    console.error(
      `[Worker ${jobId}] Missing required data: caseDocumentId=${caseDocumentId}, documentStorageId=${documentStorageId}, summonsNo=${summonsNo}`,
    );
    throw new Error(
      "Missing required data: caseDocumentId, documentStorageId, or summonsNo",
    );
  }

  let documentUrl, originalFileName;
  try {
    const docStorage = await app
      .service("documentStorages")
      .get(documentStorageId);
    if (!docStorage?.url) {
      console.error(
        `[Worker ${jobId}] Document Storage record ${documentStorageId} not found or missing URL`,
      );
      throw new Error(
        `Document Storage record ${documentStorageId} not found or missing URL`,
      );
    }
    documentUrl = docStorage.url;
    originalFileName =
      docStorage.originalFileName ||
      `Document_${documentStorageId.substring(0, 6)}`;
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching document storage: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch document storage details for ${documentStorageId}: ${err.message}`,
    );
  }

  // Fetch synonyms from accidentCases service using summonsNo (which is the accidentCases _id)
  let synonymsData = [];
  try {
    const accidentCase = await app.service("accidentCases").get(summonsNo);

    if (!accidentCase) {
      console.error(
        `[Worker ${jobId}] No accidentCases record found for _id: ${summonsNo}`,
      );
      throw new Error(`No accidentCases record found for _id: ${summonsNo}`);
    }

    synonymsData = accidentCase.synonyms || [];
    console.log(
      `[Worker ${jobId}] Fetched ${synonymsData.length} synonyms for accidentCases _id: ${summonsNo}`,
    );
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching synonyms from accidentCases for _id ${summonsNo}: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch synonyms for accidentCases _id ${summonsNo}: ${err.message}`,
    );
  }

  let apiPayload;
  if (documentType === "Plaintiff File") {
    apiPayload = {
      human:
        "You are an intelligent document reader. Your job is to extract clear, clean text from document images or PDFs. No special characters or unnecessary spaces. Do not translate the content. Output in a single paragraph.",
      documents: [{ content: documentUrl }],
      modelId: "anthropic.claude-3-opus-20240229-v1:0",
      task: "From s3 url that contains the pdf file, first identify all main sections on page 1. Then for each section, scan the rest of the PDF and extract relevant text. Structure the response as a JSON object with each section name as a key and its associated text as value.",
      noCondition:
        'If no relevant opinion is found in a document, write "No relevant opinion found for this document."',
      yesCondition:
        'Then, answer the question, starting with "Extracted Texts: [document filename]:"',
      format:
        "Thus, the format of your overall response should look like what's shown between the <example></example> tags. Make sure to follow the formatting and spacing exactly.",
      example: [
        "<example>",
        "Section",
        "[1] A copy of sealed summons no. BF-A73KJ-1-01/2023",
        "/n",
        "Extracted Texts:",
        "[1]Texts: pagenumber3 BF-A73KJ-1- 01/2023 _ Encl No. 1 HO272101 04/01/2023 li: 49: 31 BF-A73KJ-1-01/2023 DALAM MAHKAMAH etal picts KUALA KUBU 100.00 x 1 OO OO RM DALAM NEGERI SELANGOR, ",
        "",
        "</example>",
      ],
      preamble: "Here is the question for all documents:",
      question: "Extract the texts from the given image.",
      synonymous: synonymsData.map((item) => ({
        primary: item.primary,
        synonyms: item.synonymsList.join(", "),
      })),
      params: {
        max_tokens_to_sample: 4096,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ["Human"],
      },
    };
  } else if (documentType === "Adjuster Report") {
    apiPayload = {
      human:
        "You are an intelligent document reader. Your job is to extract clear, clean text from document images or PDFs. No special characters or unnecessary spaces. Do not translate the content. Output in a single paragraph.",
      documents: [{ content: documentUrl }],
      modelId: "anthropic.claude-3-opus-20240229-v1:0",
      task: "Please extract all readable text from the s3 url PDF file. Do not translate or paraphrase. Output in one clean paragraph without any funny characters or broken spacing. Extract text for the entire file. Just get the texts extracted",
      noCondition:
        'If no relevant opinion is found in a document, write "No relevant opinion found for this document."',
      yesCondition:
        'Then, answer the question, starting with "Extracted Texts: [document filename]:"',
      format:
        "Thus, the format of your overall response should look like what's shown between the <example></example> tags. Make sure to follow the formatting and spacing exactly.",
      example: [
        "<example>",
        "Extracted Texts:",
        "The complainant Anand A/L T. Baloo reported an accident involving a long shaft that detached from a lorry. The incident occurred at Hulu Selangor and the complainant wanted to add details to his previous report...",
        "</example>",
      ],
      preamble: "Here is the question for all documents:",
      question:
        "Extract the texts from the given image. make it in one paragraph",
      synonymous: synonymsData.map((item) => ({
        primary: item.primary,
        synonyms: item.synonymsList.join(", "),
      })),
      params: {
        max_tokens_to_sample: 4096,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ["Human"],
      },
    };
  } else if (documentType === "Medical File") {
    apiPayload = {
      human:
        "You are an intelligent document reader. Your job is to extract clear, clean text from document images or PDFs. No special characters or unnecessary spaces. Do not translate the content. Output in a single paragraph.",
      documents: [{ content: documentUrl }],
      modelId: "anthropic.claude-3-opus-20240229-v1:0",
      task: "Please extract all readable text from the s3 url PDF file containing medical records. Do not translate or paraphrase. Output in one clean paragraph without any funny characters or broken spacing. Extract text for the entire file, focusing on medical diagnoses, treatments, and patient details. Just get the texts extracted",
      noCondition:
        'If no relevant medical information is found in a document, write "No relevant medical information found for this document."',
      yesCondition:
        'Then, answer the question, starting with "Extracted Texts: [document filename]:"',
      format:
        "Thus, the format of your overall response should look like what's shown between the <example></example> tags. Make sure to follow the formatting and spacing exactly.",
      example: [
        "<example>",
        "Extracted Texts:",
        "Patient John Doe visited the clinic on 2023-01-15 with complaints of chest pain. Diagnosis confirmed acute myocardial infarction. Treatment included administration of aspirin and referral to cardiology for angioplasty. Follow-up scheduled for 2023-01-22...",
        "</example>",
      ],
      preamble: "Here is the question for all documents:",
      question:
        "Extract the medical texts from the given image. make it in one paragraph",
      synonymous: synonymsData.map((item) => ({
        primary: item.primary,
        synonyms: item.synonymsList.join(", "),
      })),
      params: {
        max_tokens_to_sample: 4096,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ["Human"],
      },
    };
  } else {
    console.error(
      `[Worker ${jobId}] Unsupported document type: ${documentType}`,
    );
    throw new Error(`Unsupported document type: ${documentType}`);
  }

  let extractedText;
  try {
    console.log(
      `[Worker ${jobId}] Sending extraction request to API for ${documentType}: ${EXTRACTION_API_URL}`,
    );
    const response = await axios.post(EXTRACTION_API_URL, apiPayload, {
      headers: { "Content-Type": "application/json" },
      timeout: 180000,
    });

    const apiResultContent = response?.data?.response_text || response?.data;
    if (
      !apiResultContent ||
      (typeof apiResultContent === "string" && apiResultContent.trim() === "")
    ) {
      console.warn(
        `[Worker ${jobId}] Extraction API returned empty or invalid content for ${documentType}`,
      );
      throw new Error("Extraction API returned empty or invalid content");
    }

    extractedText =
      typeof apiResultContent === "string"
        ? apiResultContent
        : JSON.stringify(apiResultContent);
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.message || "Unknown API error";
    console.error(
      `[Worker ${jobId}] Error during API call for ${documentType}: ${errorMessage}`,
    );
    throw new Error(
      `Extraction API failed for job ${jobId} (${documentType}): ${errorMessage}`,
    );
  }

  try {
    // Update caseDocuments with extracted content
    await app.service("caseDocuments").patch(caseDocumentId, {
      extractedContent: extractedText,
      updatedAt: new Date(),
    });

    if (queueId) {
      await app.service("textExtractionQueues").patch(queueId, {
        status: "completed",
        updatedAt: new Date(),
      });
    }

    // Check if a groundTruthQueue job already exists for this summonsNo
    if (app.service("groundTruthQueues")) {
      const existingGroundTruthJobs = await app
        .service("groundTruthQueues")
        .find({
          query: {
            summonsNo,
            status: { $in: ["queued", "processing", "completed"] },
          },
        });

      if (existingGroundTruthJobs.total === 0) {
        // Fetch the first caseDocumentId associated with this summonsNo
        const caseDocuments = await app.service("caseDocuments").find({
          query: {
            summonsNo: summonsNo.toString(), // Convert ObjectId to string for the query
            $limit: 1,
            $sort: { createdAt: 1 }, // Get the earliest document
          },
        });

        if (caseDocuments.total > 0) {
          const firstCaseDocumentId = caseDocuments.data[0]._id;
          await app.service("groundTruthQueues").create({
            caseDocumentId: firstCaseDocumentId,
            summonsNo,
            createdBy: createdBy || "67eea6f8dfc548354ff6b9d1",
            updatedBy: updatedBy || "67eea6f8dfc548354ff6b9d1",
            status: "queued",
          });
          console.log(
            `[Worker ${jobId}] Enqueued groundTruthQueue job for summonsNo: ${summonsNo} using caseDocumentId: ${firstCaseDocumentId}`,
          );
        } else {
          console.warn(
            `[Worker ${jobId}] No case documents found for summonsNo: ${summonsNo}, cannot enqueue groundTruthQueue job`,
          );
        }
      } else {
        console.log(
          `[Worker ${jobId}] groundTruthQueue job already exists for summonsNo: ${summonsNo}, skipping enqueue`,
        );
      }
    } else {
      console.error(
        `[Worker ${jobId}] groundTruthQueues service not registered, cannot enqueue job for summonsNo: ${summonsNo}`,
      );
      throw new Error("groundTruthQueues service not registered");
    }

    return { status: "completed", caseDocumentId, documentType };
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error updating case document, queue, accidentCases documentContent, or enqueuing groundTruthQueue for caseDocumentId ${caseDocumentId} (${documentType}): ${err.message}`,
    );
    if (queueId) {
      await app.service("textExtractionQueues").patch(queueId, {
        status: "failed",
        errorMessage: err.message,
        updatedAt: new Date(),
      });
      console.log(
        `[Worker ${jobId}] Updated queue status to failed for job ${queueId}`,
      );
    }
    throw err;
  }
};

const createTextExtractionWorker = (app) => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const jobData = { ...job.data, jobId: job.id, queueId: job.data._id };
      try {
        const result = await handleTextExtraction(app, jobData);
        console.log(
          `[Worker ${job.id}] Successfully processed job for CaseDoc ${jobData.caseDocumentId} (${jobData.documentType})`,
        );
        return result;
      } catch (err) {
        console.error(`[Worker ${job.id}] Job failed: ${err.message}`);
        if (jobData._id) {
          try {
            await app.service("textExtractionQueues").patch(jobData._id, {
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
      concurrency: 10,
      limiter: { max: 20, duration: 60000 },
      lockDuration: 300000,
      prefix: `${process.env.PROJECT_NAME}:bull`,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker ${job.id}] Failed job for CaseDoc ${job.data?.caseDocumentId} (${job.data?.documentType}): ${err.message}`,
    );
  });

  worker.on("completed", (job) => {
    console.log(
      `[Worker ${job.id}] Completed job for CaseDoc ${job.data?.caseDocumentId} (${job.data?.documentType})`,
    );
  });

  const textExtractionService = app.service("textExtractionQueues");
  textExtractionService.hooks({
    before: {
      create: async (context) => {
        const { caseDocumentId, summonsNo } = context.data;
        if (!summonsNo) {
          throw new Error("summonsNo is required for textExtractionQueues");
        }
        const existing = await app.service("textExtractionQueues").find({
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
        if (
          result.caseDocumentId &&
          result.documentStorageId &&
          result.summonsNo
        ) {
          await textExtractionQueue.add("textExtraction", result);
          console.log(
            `[Queue] Added text extraction job for CaseDoc ${result.caseDocumentId} with summonsNo: ${result.summonsNo}`,
          );
        }
        return context;
      },
    },
  });

  return worker;
};

module.exports = { createTextExtractionWorker, textExtractionQueue };
