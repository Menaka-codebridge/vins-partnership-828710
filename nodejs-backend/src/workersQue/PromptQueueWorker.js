const { Queue, Worker } = require("bullmq");
const connection = require("../cbServices/redis/config");
const {
  promisePromptProcessingFunctionCall,
} = require("./promisePromptProcessingFunctionCall");

const QUEUE_NAME = "promptQueue";

const promptQueue = new Queue(QUEUE_NAME, {
  connection,
  prefix: `${process.env.PROJECT_NAME}:bull`,
});

const handlePromptInputProcessing = async (
  app,
  {
    sectionContentId,
    summonsNo,
    promptUsed,
    jobId = "N/A",
    queueId,
    createdBy,
    updatedBy,
  },
) => {
  if (!sectionContentId || !summonsNo || !promptUsed) {
    console.error(
      `[Worker ${jobId}] Missing required data: sectionContentId=${sectionContentId}, summonsNo=${summonsNo}, promptUsed=${promptUsed}`,
    );
    throw new Error(
      "Missing required data: sectionContentId, summonsNo, or promptUsed",
    );
  }

  let sectionContent;
  try {
    // Fetch sectionContents with populated llmPrompts
    sectionContent = await app
      .service("sectionContents")
      .get(sectionContentId, {
        query: { $populate: ["llmPrompts"] },
      });
    if (!sectionContent) {
      console.error(
        `[Worker ${jobId}] SectionContents record ${sectionContentId} not found`,
      );
      throw new Error(`SectionContents record ${sectionContentId} not found`);
    }
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching sectionContents: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch sectionContents for ${sectionContentId}: ${err.message}`,
    );
  }

  // Validate updatedBy
  const defaultUserId = "67eea6f8dfc548354ff6b9d1";
  let validUpdatedBy = updatedBy || defaultUserId;
  if (
    typeof validUpdatedBy !== "string" &&
    (!validUpdatedBy || !validUpdatedBy._id)
  ) {
    console.warn(
      `[Worker ${jobId}] Invalid updatedBy value: ${JSON.stringify(validUpdatedBy)}. Using default user ID: ${defaultUserId}`,
    );
    validUpdatedBy = defaultUserId;
  }

  // Handle Confusion Matrix processing
  if (promptUsed === "Update Confusion Matrix and Conclusion") {
    if (!sectionContent.initialInference || !sectionContent.groundTruth) {
      console.log(
        `[Worker ${jobId}] Missing initialInference or groundTruth for sectionContentId ${sectionContentId}. Cannot process Confusion Matrix.`,
      );
      try {
        await app.service("sectionContents").patch(sectionContentId, {
          confusionMatrix:
            "Cannot generate confusion matrix: Missing initial inference or ground truth.",
          conclusion: "",
          updatedAt: new Date(),
          updatedBy: validUpdatedBy,
        });
        console.log(
          `[Worker ${jobId}] Updated sectionContents ${sectionContentId} with error message for missing data`,
        );

        if (queueId) {
          await app.service("promptQueues").patch(queueId, {
            status: "completed",
            errorMessage: "",
            updatedAt: new Date(),
            updatedBy: validUpdatedBy,
          });
          console.log(
            `[Worker ${jobId}] Updated promptQueues ${queueId} to completed`,
          );
        }

        return { status: "completed", sectionContentId };
      } catch (err) {
        console.error(
          `[Worker ${jobId}] Error updating sectionContents with error message: ${err.message}`,
        );
        throw err;
      }
    }

    // Fetch Confusion Matrix LLM prompt configuration
    let confusionMatrixPromptCall;
    try {
      const llmPromptCalls = await app.service("llmPromptCalls").find({
        query: { name: "Confusion Matrix" },
      });
      confusionMatrixPromptCall = llmPromptCalls.data[0];
      if (!confusionMatrixPromptCall) {
        console.error(
          `[Worker ${jobId}] No LLM prompt call found for name: Confusion Matrix`,
        );
        throw new Error("No LLM prompt call found for Confusion Matrix");
      }
    } catch (err) {
      console.error(
        `[Worker ${jobId}] Error fetching Confusion Matrix LLM prompt: ${err.message}`,
      );
      throw new Error(
        `Failed to fetch Confusion Matrix LLM prompt: ${err.message}`,
      );
    }

    // Construct API payload for Confusion Matrix
    const confusionMatrixPayload = {
      ...confusionMatrixPromptCall.content,
      documents: [
        {
          content: `Infer statement: ${sectionContent.initialInference}`,
          filename: "infer_statement.txt",
          filepath: "infer_statement.txt",
        },
        {
          content: sectionContent.groundTruth,
          filename: "ground_truth.txt",
          filepath: "ground_truth.txt",
        },
      ],
      synonymous: (await app.service("accidentCases").get(summonsNo)).synonyms
        .filter((item) => item && item.primary && item.synonymsList)
        .map((item) => ({
          primary: item.primary,
          synonyms: item.synonymsList.join(", "),
        })),
      question: confusionMatrixPromptCall.content.question,
      params: {
        max_tokens_to_sample:
          confusionMatrixPromptCall.content.params.max_tokens_to_sample || 4096,
        temperature:
          confusionMatrixPromptCall.content.params.temperature || 0.5,
        top_k: confusionMatrixPromptCall.content.params.top_k || 250,
        top_p: confusionMatrixPromptCall.content.params.top_p || 1,
        stop_sequences: confusionMatrixPromptCall.content.params
          .stop_sequences || ["Human"],
      },
    };

    // Call Confusion Matrix API
    let confusionMatrixResult;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        confusionMatrixResult = await promisePromptProcessingFunctionCall(
          jobId,
          confusionMatrixPayload,
        );
        console.log(
          `[Worker ${jobId}] Successfully received Confusion Matrix response for sectionContentId ${sectionContentId}`,
        );
        break;
      } catch (err) {
        console.error(
          `[Worker ${jobId}] Confusion Matrix API attempt ${attempt} failed: ${err.message}`,
        );
        if (attempt === maxRetries) {
          throw err;
        }
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(
          `[Worker ${jobId}] Retrying Confusion Matrix API after ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    try {
      // Update sectionContents with API response
      await app.service("sectionContents").patch(sectionContentId, {
        confusionMatrix:
          confusionMatrixResult.confusionMatrix ||
          confusionMatrixResult.completion ||
          "No confusion matrix generated.",
        conclusion: confusionMatrixResult.conclusion || "",
        updatedAt: new Date(),
        updatedBy: validUpdatedBy,
      });
      console.log(
        `[Worker ${jobId}] Updated sectionContents ${sectionContentId} with Confusion Matrix and Conclusion`,
      );

      // Update promptQueues status to completed
      if (queueId) {
        await app.service("promptQueues").patch(queueId, {
          status: "completed",
          errorMessage: "",
          updatedAt: new Date(),
          updatedBy: validUpdatedBy,
        });
        console.log(
          `[Worker ${jobId}] Updated promptQueues ${queueId} to completed`,
        );
      }

      // Store token usage
      const { inputTokens, outputTokens, totalTokens } = confusionMatrixResult;
      await app.service("tokenUsage").create({
        jobId,
        sectionContentId,
        promptQueueId: queueId,
        summonsNo,
        section: sectionContent.section,
        subsection: sectionContent.subsection,
        inputTokens,
        outputTokens,
        totalTokens,
        createdBy: validUpdatedBy,
        updatedBy: validUpdatedBy,
      });
      console.log(
        `[Worker ${jobId}] Stored token usage for sectionContentId ${sectionContentId}, jobId ${jobId}, tokens: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}`,
      );

      console.log(
        `[Worker ${jobId}] Successfully updated sectionContents ${sectionContentId} and promptQueues ${queueId} with Confusion Matrix, Conclusion, and token counts`,
      );

      return { status: "completed", sectionContentId };
    } catch (err) {
      console.error(
        `[Worker ${jobId}] Error updating sectionContents, promptQueues, or token_usage for sectionContentId ${sectionContentId}: ${err.message}`,
      );
      console.error(`[Worker ${jobId}] Error stack: ${err.stack}`);
      throw err;
    }
  }

  // Handle regular prompt processing for initialInference
  let llmPromptCall = sectionContent.llmPrompts;
  if (!llmPromptCall || !llmPromptCall.content) {
    console.warn(
      `[Worker ${jobId}] No LLM prompt call configuration found for sectionContentId ${sectionContentId}, using default`,
    );
    llmPromptCall = {
      content: {
        model: "anthropic.claude-3-opus-20240229-v1:0",
        prompt_template: "Summarize the following document: {document}",
        params: {
          max_tokens_to_sample: 4096,
          temperature: 0.5,
          top_k: 250,
          top_p: 1,
          stop_sequences: ["Human"],
        },
      },
    };
  }

  let accidentCase;
  try {
    // Fetch accidentCases for documentContent and synonyms
    accidentCase = await app.service("accidentCases").get(summonsNo);
    if (!accidentCase) {
      console.error(
        `[Worker ${jobId}] No accidentCases record found for _id: ${summonsNo}`,
      );
      throw new Error(`No accidentCases record found for _id: ${summonsNo}`);
    }
    console.log(
      `[Worker ${jobId}] Fetched accidentCases record for _id: ${summonsNo}`,
    );
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error fetching accidentCases for _id ${summonsNo}: ${err.message}`,
    );
    throw new Error(
      `Failed to fetch accidentCases for _id ${summonsNo}: ${err.message}`,
    );
  }

  // Construct API payload for initial inference
  const apiPayload = {
    ...llmPromptCall.content,
    documents: accidentCase.documentContent
      .filter((doc) => doc && doc.content)
      .map((doc) => ({
        content: doc.content,
        filepath: doc.filepath,
        filename: doc.filename,
      })),
    synonymous: accidentCase.synonyms
      .filter((item) => item && item.primary && item.synonymsList)
      .map((item) => ({
        primary: item.primary,
        synonyms: item.synonymsList.join(", "),
      })),
    question: promptUsed,
    params: {
      max_tokens_to_sample:
        sectionContent.maxLength ||
        llmPromptCall.content.params.max_tokens_to_sample ||
        4096,
      temperature:
        sectionContent.temperature ||
        llmPromptCall.content.params.temperature ||
        0.5,
      top_k: sectionContent.topK || llmPromptCall.content.params.top_k || 250,
      top_p: sectionContent.topP || llmPromptCall.content.params.top_p || 1,
      stop_sequences: llmPromptCall.content.params?.stop_sequences || ["Human"],
    },
  };

  let apiResult;
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      apiResult = await promisePromptProcessingFunctionCall(jobId, apiPayload);
      console.log(
        `[Worker ${jobId}] Successfully received prompt processing response for sectionContentId ${sectionContentId}`,
      );
      break;
    } catch (err) {
      console.error(
        `[Worker ${jobId}] API attempt ${attempt} failed: ${err.message}`,
      );
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`[Worker ${jobId}] Retrying after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Update sectionContents and token_usage
  try {
    // Store token usage
    const { inputTokens, outputTokens, totalTokens } = apiResult;
    await app.service("tokenUsage").create({
      jobId,
      sectionContentId,
      promptQueueId: queueId,
      summonsNo,
      section: sectionContent.section,
      subsection: sectionContent.subsection,
      inputTokens,
      outputTokens,
      totalTokens,
      createdBy: validUpdatedBy,
      updatedBy: validUpdatedBy,
    });
    console.log(
      `[Worker ${jobId}] Stored token usage for sectionContentId ${sectionContentId}, jobId ${jobId}, tokens: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}`,
    );

    await app.service("sectionContents").patch(sectionContentId, {
      initialInference: apiResult.completion || "",
      retrievedFrom: apiResult.retrievedContext || "",
      updatedAt: new Date(),
      updatedBy: validUpdatedBy,
    });
    console.log(
      `[Worker ${jobId}] Updated sectionContents ${sectionContentId} with initial inference`,
    );

    // Update promptQueues status to completed if queueId exists
    if (queueId) {
      await app.service("promptQueues").patch(queueId, {
        status: "completed",
        errorMessage: "",
        updatedAt: new Date(),
        updatedBy: validUpdatedBy,
      });
      console.log(
        `[Worker ${jobId}] Updated promptQueues ${queueId} to completed`,
      );
    } else {
      console.warn(
        `[Worker ${jobId}] No queueId provided for sectionContentId ${sectionContentId}, skipping promptQueues update`,
      );
    }

    console.log(
      `[Worker ${jobId}] Successfully updated sectionContents ${sectionContentId} with initial inference and token counts`,
    );
    return { status: "completed", sectionContentId };
  } catch (err) {
    console.error(
      `[Worker ${jobId}] Error updating sectionContents, token_usage, or promptQueues for sectionContentId ${sectionContentId}: ${err.message}`,
    );
    console.error(`[Worker ${jobId}] Error stack: ${err.stack}`);
    throw err;
  }
};

const createPromptQueueWorker = (app) => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(
        `[Worker ${job.id}] Processing job with data:`,
        JSON.stringify(job.data, null, 2),
      );
      if (!job.data._id) {
        console.warn(
          `[Worker ${job.id}] Job data missing _id for sectionContentId ${job.data.sectionContentId}`,
        );
      }
      const jobData = { ...job.data, jobId: job.id, queueId: job.data._id };
      try {
        const result = await handlePromptInputProcessing(app, jobData);
        console.log(
          `[Worker ${job.id}] Successfully processed job for sectionContentId ${jobData.sectionContentId}`,
        );
        return result;
      } catch (err) {
        console.error(`[Worker ${job.id}] Job failed: ${err.message}`);
        if (jobData._id) {
          try {
            await app.service("promptQueues").patch(jobData._id, {
              status: "failed",
              errorMessage: err.message || "Unknown error",
              updatedAt: new Date(),
              updatedBy: jobData.updatedBy || "67eea6f8dfc548354ff6b9d1",
            });
            console.log(
              `[Worker ${job.id}] Updated queue status to failed for job ${jobData._id}`,
            );
          } catch (queueErr) {
            console.error(
              `[Worker ${job.id}] Failed to update queue status: ${queueErr.message}`,
            );
          }
        } else {
          console.warn(
            `[Worker ${job.id}] Cannot update promptQueues: queueId is undefined`,
          );
        }
        throw err;
      }
    },
    {
      connection,
      concurrency: 10,
      limiter: { max: 20, duration: 60000 }, // 20 jobs per minute
      lockDuration: 300000,
      prefix: `${process.env.PROJECT_NAME}:bull`,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker ${job.id}] Failed job for sectionContentId ${job.data?.sectionContentId}: ${err.message}`,
    );
  });

  worker.on("completed", (job) => {
    console.log(
      `[Worker ${job.id}] Completed job for sectionContentId ${job.data?.sectionContentId}`,
    );
  });

  const promptQueueService = app.service("promptQueues");
  promptQueueService.hooks({
    before: {
      create: async (context) => {
        const { sectionContentId, summonsNo, promptUsed, errorMessage } =
          context.data;
        if (!sectionContentId || !summonsNo || !promptUsed) {
          throw new Error(
            "sectionContentId, summonsNo, and promptUsed are required for promptQueues",
          );
        }
        context.data.errorMessage = errorMessage || "";
        const existing = await app.service("promptQueues").find({
          query: {
            sectionContentId,
            status: { $in: ["queued", "processing"] },
          },
        });
        if (existing.total > 0) {
          context.result = {
            ...context.data,
            status: "skipped",
            errorMessage:
              "Your request is already being processed. Please wait for it to complete.",
            updatedAt: new Date(),
            updatedBy: context.data.updatedBy || "67eea6f8dfc548354ff6b9d1",
          };
          console.log(
            `[Queue] Skipped creating duplicate job for sectionContentId ${sectionContentId} as a job is already queued or processing`,
          );
          return context;
        }
        return context;
      },
    },
    after: {
      create: async (context) => {
        const { result } = context;
        if (result.status === "skipped") {
          console.log(
            `[Queue] Not adding job to queue for sectionContentId ${result.sectionContentId} due to existing job`,
          );
          return context;
        }
        console.log(
          `[Queue] Adding job with promptQueues data:`,
          JSON.stringify(result, null, 2),
        );
        if (result.sectionContentId && result.summonsNo && result._id) {
          await promptQueue.add("promptInputProcessing", result);
          console.log(
            `[Queue] Added prompt input processing job for sectionContentId ${result.sectionContentId} with summonsNo: ${result.summonsNo}`,
          );
        } else {
          console.error(
            `[Queue] Failed to add job: Missing required fields in promptQueues data`,
            JSON.stringify(result, null, 2),
          );
        }
        return context;
      },
    },
  });

  return worker;
};

module.exports = { createPromptQueueWorker, promptQueue };
