const { Queue, Worker } = require("bullmq");
const connection = require("../cbServices/redis/config");
const QUEUE_NAME = "textExtractionQueue";
const axios = require("axios");
const retry = require("async-retry");

const textExtractionQueue = new Queue(QUEUE_NAME, {
  connection,
  prefix: `${process.env.PROJECT_NAME}:bull`,
});

const FILE_CONVERTOR_API_URL =
  "https://fileconverter.codebridge.app/fileConvertor";

const callFileConvertorApi = async (jobId, payload) => {
  try {
    console.log(
      `[Worker ${jobId}] Sending request to File Convertor API: ${FILE_CONVERTOR_API_URL}`,
    );
    const response = await retry(
      async () => {
        return axios.post(FILE_CONVERTOR_API_URL, payload, {
          headers: { "Content-Type": "application/json" },
          timeout: 300000,
        });
      },
      {
        retries: 3,
        minTimeout: 2000,
        maxTimeout: 10000,
        onRetry: (err, attempt) => {
          console.warn(
            `[Worker ${jobId}] Retry attempt ${attempt} for File Convertor API: ${err.message}`,
          );
        },
      },
    );

    if (response.status !== 200) {
      console.warn(
        `[Worker ${jobId}] File Convertor API returned status: ${response.status}`,
      );
      throw new Error(`File Convertor API returned status: ${response.status}`);
    }

    return response.data;
  } catch (err) {
    let errorMessage;
    if (err.response?.status === 502) {
      errorMessage = `File Convertor API returned 502 Bad Gateway. Verify ${FILE_CONVERTOR_API_URL} is operational.`;
    } else if (err.code === "ECONNREFUSED") {
      errorMessage = `Failed to connect to ${FILE_CONVERTOR_API_URL}. Ensure the server is running.`;
    } else if (err.code === "ETIMEDOUT") {
      errorMessage = `Request to ${FILE_CONVERTOR_API_URL} timed out after 300s.`;
    } else {
      errorMessage =
        err.response?.data?.error || err.message || "Unknown API error";
    }
    console.error(
      `[Worker ${jobId}] File Convertor API error: ${errorMessage}`,
    );
    throw new Error(
      `File Convertor API failed for job ${jobId}: ${errorMessage}`,
    );
  }
};

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
    originalFileName = docStorage.name;
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching document storage: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch document storage details for ${documentStorageId}: ${err.message}`,
    );
  }

  try {
    const payload = {
      mongoDbUrl:
        "mongodb+srv://vinsapp:E1b8I7WSvKISgWj9@vinpartnership.eypigx2.mongodb.net/vins-partnership?retryWrites=true&w=majority",
      databaseName: "vins-partnership",
      collectionName: "case_documents",
      fieldToUpdate: "extractedContent",
      documentId: caseDocumentId.toString(),
      requestedS3Location: documentUrl,
      s3Bucket: "code-bridge-apps",
      s3ObjectKey: `vins-partnership/${originalFileName}`,
      userId: createdBy || "67f47e82e4bfdc2502066579",
      callbackUrl: `https://app14.apps.uat.codebridge.live/textExtractionCallback`,
      callbackData: {
        caseDocumentId,
        summonsNo,
        documentStorageId,
        documentType,
        queueId,
        createdBy,
        updatedBy,
      },
    };

    console.log("payload", payload);
    console.log(
      `[Worker ${jobId}] File Convertor API payload:`,
      JSON.stringify(payload, null, 2),
    );

    await callFileConvertorApi(jobId, payload);

    console.log(
      `[Worker ${jobId}] File Convertor API called successfully for CaseDoc ${caseDocumentId}`,
    );
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error calling File Convertor API: ${err.message}`,
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
        await handleTextExtraction(app, jobData);
        console.log(
          `[Worker ${job.id}] Successfully processed job for CaseDoc ${jobData.caseDocumentId} (${jobData.documentType})`,
        );
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
