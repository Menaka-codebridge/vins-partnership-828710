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
      // Fallback: Approximate 1 token ~ 4 characters
      return new Array(Math.ceil(text.length / 4));
    },
  };
}

const calculateTokens = (payload, responseText) => {
  // Serialize payload to string for token counting
  let inputText = "";
  if (payload.question) inputText += payload.question + "\n";
  if (payload.documents && Array.isArray(payload.documents)) {
    payload.documents.forEach((doc) => {
      if (doc.content) inputText += `<document>${doc.content}</document>\n`;
    });
  }
  if (payload.synonymous && Array.isArray(payload.synonymous)) {
    payload.synonymous.forEach((syn) => {
      inputText += `Primary: ${syn.primary}, Synonyms: ${syn.synonyms}\n`;
    });
  }
  if (payload.prompt_template) inputText += payload.prompt_template + "\n";
  if (payload.params) {
    inputText += JSON.stringify(payload.params) + "\n";
  }

  const inputTokens = encoding.encode(inputText).length;
  const outputTokens = responseText ? encoding.encode(responseText).length : 0;
  const totalTokens = inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
};

const promisePromptProcessingFunctionCall = async (jobId, apiPayload) => {
  try {
    // Log payload details for debugging
    const docCount = apiPayload.documents ? apiPayload.documents.length : 0;
    const totalContentLength = apiPayload.documents
      ? apiPayload.documents.reduce(
          (sum, doc) => sum + (doc.content ? doc.content.length : 0),
          0,
        )
      : 0;
    console.log(
      `[Worker ${jobId}] Sending payload with ${docCount} documents, total content length: ${totalContentLength} characters`,
    );

    const startTime = Date.now();
    const response = await axios.post(
      "https://cytcmhlrg2hpzfjymbszuann3m0lmlvn.lambda-url.us-west-2.on.aws",
      apiPayload,
      { headers: { "Content-Type": "application/json" }, timeout: 120000 },
    );
    const duration = Date.now() - startTime;
    console.log(
      `[Worker ${jobId}] API response received after ${duration}ms:`,
      JSON.stringify(response.data, null, 2),
    );

    let completion, retrievedContext, confusionMatrix, conclusion;

    // Check if response contains response_text
    if (response.data.response_text) {
      const responseText = response.data.response_text.trim();

      // Calculate token counts
      const { inputTokens, outputTokens, totalTokens } = calculateTokens(
        apiPayload,
        responseText,
      );
      console.log(
        `[Worker ${jobId}] Token counts: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}`,
      );

      // Check if the response indicates no findings
      if (responseText.includes("No relevant findings")) {
        completion = responseText;
        retrievedContext = "";
        confusionMatrix = null;
        conclusion = "";
      } else {
        // Check if response is for Confusion Matrix
        const confusionMatrixMatch = responseText.match(
          /Confusion Matrix:([\s\S]*?)Conclusion:/,
        );
        const conclusionMatch = responseText.match(/Conclusion:([\s\S]*)$/);

        if (confusionMatrixMatch && conclusionMatch) {
          // Valid Confusion Matrix API response
          completion = "";
          retrievedContext = "";
          confusionMatrix = confusionMatrixMatch[1].trim();
          conclusion = conclusionMatch[1].trim();
        } else {
          // Handle error messages or non-standard responses
          if (
            responseText.includes("no GroundTruth statement provided") ||
            responseText.includes(
              "not possible to create a confusion matrix",
            ) ||
            responseText.includes("invalid") ||
            responseText.includes("missing")
          ) {
            completion = "";
            retrievedContext = "";
            confusionMatrix = responseText; // Store error message
            conclusion = "";
          } else {
            // Regular API response with Relevant Extracts
            const extractsMatch = responseText.match(
              /Relevant Extracts:([\s\S]*)$/,
            );
            const contentBeforeExtracts = extractsMatch
              ? responseText.replace(/Relevant Extracts:[\s\S]*$/, "").trim()
              : responseText;

            completion = contentBeforeExtracts || responseText;
            retrievedContext = extractsMatch ? extractsMatch[1].trim() : "";
            confusionMatrix = null;
            conclusion = "";
          }
        }
      }

      return {
        completion,
        retrievedContext,
        confusionMatrix,
        conclusion,
        inputTokens,
        outputTokens,
        totalTokens,
      };
    } else {
      // Fallback to expected structure
      const { completion, retrievedContext, confusionMatrix, conclusion } =
        response.data;

      // Calculate token counts (fallback case)
      const { inputTokens, outputTokens, totalTokens } = calculateTokens(
        apiPayload,
        response.data.response_text || JSON.stringify(response.data),
      );
      console.log(
        `[Worker ${jobId}] Token counts: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}`,
      );

      return {
        completion,
        retrievedContext,
        confusionMatrix,
        conclusion,
        inputTokens,
        outputTokens,
        totalTokens,
      };
    }
  } catch (err) {
    console.error(`[Worker ${jobId}] Error during API call: ${err.message}`);
    console.error(
      `[Worker ${jobId}] Error details:`,
      err.response ? JSON.stringify(err.response.data) : "No response data",
    );
    throw new Error(`Prompt API failed for job ${jobId}: ${err.message}`);
  }
};

module.exports = { promisePromptProcessingFunctionCall };
