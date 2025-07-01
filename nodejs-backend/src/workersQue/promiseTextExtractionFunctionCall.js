const axios = require("axios");
const retry = require("async-retry");

const FILE_CONVERTOR_API_URL =
  "https://fileconverter.codebridge.app/fileConvertor";

const promiseTextExtractionFunctionCall = async (jobId, apiPayload) => {
  try {
    console.log(
      `[Worker ${jobId}] Sending extraction request to FileConvertor API: ${FILE_CONVERTOR_API_URL}`,
    );

    // Prepare payload for fileConvertor API
    const fileConvertorPayload = {
      projectId: "vins-partnership",
      projectCollection: "textExtractionQueues",
      collectionId: apiPayload.caseDocumentId || "N/A",
      secretKey:
        process.env.FILE_CONVERTOR_SECRET_KEY ||
        "sFp8oxBqAM6kyrFsrA/LhDc+vla8fvWpWxy1WPWK",
      callBackUrl: "https://vins-app.codebridge.app/textExtractionCallback",
      requestedS3Location: apiPayload.documents?.[0]?.content || "",
      userId: apiPayload.createdBy || "67f47e82e4bfdc2502066579",
      s3Bucket: "code-bridge-apps", // S3 bucket
      s3ObjectKey:
        apiPayload.documents?.[0]?.content.split("amazonaws.com/")[1] || "",
      mongoDbUrl:
        process.env.MONGO_DB_URL ||
        "mongodb+srv://vinsapp:E1b8I7WSvKISgWj9@vinpartnership.eypigx2.mongodb.net/vins-partnership?retryWrites=true&w=majority", // MongoDB connection
      fieldsToUpdate: {
        status: "Process Completed",
        isUploadedToS3: true,
        isProcessing: false,
        responseS3Location: "{s3_url}",
        updatedAt: "{timestamp}",
      },
    };

    if (
      !fileConvertorPayload.requestedS3Location ||
      !fileConvertorPayload.s3ObjectKey
    ) {
      console.error(
        `[Worker ${jobId}] Missing S3 location or object key in payload`,
      );
      throw new Error("Missing S3 location or object key for file conversion");
    }

    const response = await retry(
      async () => {
        return axios.post(FILE_CONVERTOR_API_URL, fileConvertorPayload, {
          headers: { "Content-Type": "application/json" },
          timeout: 300000, // 5 minutes for large PDFs
        });
      },
      {
        retries: 3,
        minTimeout: 2000,
        maxTimeout: 10000,
        onRetry: (err, attempt) => {
          console.warn(
            `[Worker ${jobId}] Retry attempt ${attempt} for API call: ${err.message}`,
          );
        },
      },
    );

    const apiResult = response?.data;
    if (apiResult.status !== "in-process") {
      console.warn(
        `[Worker ${jobId}] FileConvertor API returned status: ${apiResult.status}`,
      );
      throw new Error(
        `FileConvertor API failed to start processing: ${apiResult.data || "unknown error"}`,
      );
    }

    console.log(
      `[Worker ${jobId}] FileConvertor job enqueued: ${JSON.stringify(apiResult.data)}`,
    );
    return "File conversion enqueued, awaiting callback";
  } catch (err) {
    let errorMessage;
    if (err.response?.status === 502) {
      errorMessage = `API returned 502 Bad Gateway. Verify ${FILE_CONVERTOR_API_URL} is operational.`;
    } else if (err.code === "ECONNREFUSED") {
      errorMessage = `Failed to connect to ${FILE_CONVERTOR_API_URL}. Ensure the server is running.`;
    } else if (err.code === "ETIMEDOUT") {
      errorMessage = `Request to ${FILE_CONVERTOR_API_URL} timed out after 300s. Check server load.`;
    } else {
      errorMessage =
        err.response?.data?.error || err.message || "Unknown API error";
    }
    console.error(`[Worker ${jobId}] Error during API call: ${errorMessage}`);
    throw new Error(
      `FileConvertor API failed for job ${jobId}: ${errorMessage}`,
    );
  }
};

module.exports = { promiseTextExtractionFunctionCall };
