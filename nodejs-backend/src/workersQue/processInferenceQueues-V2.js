const { Queue, Worker } = require("bullmq");
const connection = require("../cbServices/redis/config");
const {
  promiseSectionSubSectionFunctionCall,
} = require("./promiseSectionSubSectionFunctionCall");

const QUEUE_NAME = "groundTruthQueue";
const groundTruthQueue = new Queue(QUEUE_NAME, {
  connection,
  prefix: `${process.env.PROJECT_NAME}:bull`,
});

const hasMedicalContent = (documents) => {
  return documents.some(
    (doc) =>
      doc.content && /injury|medical|hospital|treatment/i.test(doc.content),
  );
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

  let llmPrompts = [];
  try {
    const result = await app.service("llmPromptCalls").find({
      query: { collectionName: { $ne: "textExtraction" } },
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
    let groundTruthTextAPICaller = [];
    for (let i = 0; i < llmPrompts.length; i++) {
      const prompt = llmPrompts[i];
      const { _id, section, subsection, content, order = i + 1 } = prompt;
      const llmId = _id;

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

      // Skip General Damages if no medical content
      if (
        section === "Quantum" &&
        subsection.includes("General Damages") &&
        !hasMedicalContent(documentContent)
      ) {
        console.warn(
          `[Worker ${jobId}] Skipping ${section}/${subsection}: No medical content available`,
        );
        results.push({
          section,
          subsection,
          status: "skipped",
          message: "No medical content available for General Damages",
        });
        continue;
      }

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

      const promptUsed = content.question || content.human || "";

      groundTruthTextAPICaller.push(
        promiseSectionSubSectionFunctionCall(
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
        ).catch((err) => {
          console.error(
            `[Worker ${jobId}] Error processing ${section}/${subsection}: ${err.message}`,
          );
          return {
            section,
            subsection,
            status: "failed",
            error: err.message,
          };
        }),
      );
    }

    const complete = await Promise.all(groundTruthTextAPICaller);
    complete.forEach((result) => results.push(result));

    // Update queue status
    if (queueId) {
      const jobStatus = results.every(
        (r) => r.status === "completed" || r.status === "skipped",
      )
        ? "completed"
        : "failed";
      const errorMessage = results
        .filter((r) => r.status !== "completed" && r.status !== "skipped")
        .map(
          (r) => `Failed ${r.section}/${r.subsection}: ${r.error || r.message}`,
        )
        .join("; ");

      await app.service("groundTruthQueues").patch(queueId, {
        status: jobStatus,
        updatedAt: new Date(),
        errorMessage: errorMessage || undefined,
      });
      console.log(
        `[Worker ${jobId}] Updated queue status for job ${queueId} to ${jobStatus}`,
      );
    }

    // Fetch user for email
    let user;
    try {
      const userData = await app.service("users").find({
        query: { _id: userId },
      });
      user = userData.data[0];
      if (!user) {
        console.warn(
          `[Worker ${jobId}] User ${userId} not found, using default email`,
        );
      }
    } catch (err) {
      console.error(
        `[Worker ${jobId}] Error fetching user ${userId}: ${err.message}`,
      );
    }

    const userEmail = user?.email || "info@cloudbasha.com";
    const userName = user?.name || "User";
    const baseUrl =
      process.env.APP_BASE_URL || "https://app14.apps.uat.codebridge.live";
    const accidentCaseUrl = `${baseUrl}/accidentCases/${summonsNo}`;

    // Send email based on job status
    if (
      results.every((r) => r.status === "completed" || r.status === "skipped")
    ) {
      const mailData = {
        name: "on_accident_case_created",
        type: "groundTruthQueue",
        from: process.env.MAIL_USERNAME,
        recipients: [userEmail],
        status: true,
        subject: "Accident Case Created Successfully",
        templateId: "onAccidentCaseCreated",
        content: `<p>Hi ${userName},</p><p>We are pleased to inform you that an accident case has been successfully created in ${process.env.PROJECT_LABEL || process.env.PROJECT_NAME}.</p><p><strong>Case Details:</strong></p><p>Summons No: ${summonsNo}</p><p>Case Document ID: ${caseDocumentId}</p><p><a href="${accidentCaseUrl}" target="_blank" rel="noopener noreferrer">View Case Details</a></p><p>This is an automated email. Please do not reply directly to this message.</p>`,
        data: {
          caseDocumentId,
          summonsNo,
          name: userName,
          email: userEmail,
          projectLabel: process.env.PROJECT_LABEL || process.env.PROJECT_NAME,
          accidentCaseUrl,
        },
      };

      console.log(`[Worker ${jobId}] Sending success email to ${userEmail}`);
      await app.service("mailQues").create(mailData);
      console.log(`[Worker ${jobId}] Success email sent to ${userEmail}`);
    } else {
      const errorMessage = results
        .filter((r) => r.status !== "completed" && r.status !== "skipped")
        .map(
          (r) => `Failed ${r.section}/${r.subsection}: ${r.error || r.message}`,
        )
        .join("; ");

      const mailData = {
        name: "on_accident_case_failed",
        type: "groundTruthQueue",
        from: process.env.MAIL_USERNAME,
        recipients: [userEmail, "info@cloudbasha.com"],
        status: false,
        subject: "Accident Case Creation Failed",
        templateId: "onAccidentCaseFailed",
        content: `<p>Hi ${userName},</p><p>We regret to inform you that the creation of an accident case in ${process.env.PROJECT_LABEL || process.env.PROJECT_NAME} has failed.</p><p><strong>Case Details:</strong></p><p>Summons No: ${summonsNo}</p><p>Case Document ID: ${caseDocumentId}</p><p>Error: ${errorMessage}</p><p><a href="${accidentCaseUrl}" target="_blank" rel="noopener noreferrer">View Case Details</a></p><p>Please contact support at info@cloudbasha.com for assistance.</p><p>This is an automated email. Please do not reply directly to this message.</p>`,
        data: {
          caseDocumentId,
          summonsNo,
          name: userName,
          email: userEmail,
          projectLabel: process.env.PROJECT_LABEL || process.env.PROJECT_NAME,
          accidentCaseUrl,
          errorMessage,
        },
      };

      console.log(`[Worker ${jobId}] Sending failure email to ${userEmail}`);
      await app.service("mailQues").create(mailData);
      console.log(`[Worker ${jobId}] Failure email sent to ${userEmail}`);
    }
  }

  return {
    status: results.every(
      (r) => r.status === "completed" || r.status === "skipped",
    )
      ? "completed"
      : "failed",
    caseDocumentId,
    results,
  };
};

const createInferenceWorker = (app) => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const jobData = { ...job.data, jobId: job.id, queueId: job.data._id };
      console.log(jobData);
      try {
        const result = await handleInferenceGeneration(app, jobData);
        console.log("handleInferenceGeneration", result);
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
      prefix: `${process.env.PROJECT_NAME}:bull`,
      concurrency: 5,
      limiter: { max: 10, duration: 60000 },
      lockDuration: 300000,
    },
  );

  const groundTruthService = app.service("groundTruthQueues");
  groundTruthService.hooks({
    before: {
      create: async (context) => {
        const { caseDocumentId, summonsNo } = context.data;
        if (!summonsNo || !caseDocumentId) {
          throw new Error(
            "summonsNo and caseDocumentId are required for groundTruthQueues",
          );
        }
        const existing = await groundTruthService.find({
          query: {
            caseDocumentId,
            summonsNo,
            status: { $in: ["queued", "processing", "completed"] },
          },
        });
        if (existing.total > 0) {
          throw new Error(
            `Queue entry already exists for caseDocumentId: ${caseDocumentId} and summonsNo: ${summonsNo}`,
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
