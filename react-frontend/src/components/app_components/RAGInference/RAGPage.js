import React, { useEffect } from "react";
import { use } from "react";
import RAG from "./RAG"; // Assuming RAG.js is in the same directory

const RAGPage = () => {
  const rag = null;
  const response = null;
  const extractedText = null;
  const EXTRACTION_API_URL = process.env.LLM_CLASS3;

  useEffect(() => {
    // This effect runs once when the component mounts
    console.log("RAGPage component mounted");
    rag = new RAG();
  }, []);

  const handleQuery = async (query) => {
    // This function can be used to handle user queries
    try {
      response = await rag.run(query);
      console.log("RAG response:", response);
      const llmPrompt = await app.service("llmPromptCalls").find({
        query: {
          collectionName: "caseDocuments",
          section: "Background and Facts",
          subSection: "Sketch Plan",
        },
      });
      // Assuming llmPrompt is an array and we want to use the first one
      if (llmPrompt && llmPrompt.data.length > 0) {
        const prompt = llmPrompt.data[0].content;
        prompt.documents = response.sourceDocuments.map((doc) => ({
          content: doc,
        }));

        console.log("Documents in prompt:", prompt.documents);
        axios
          .post(EXTRACTION_API_URL, prompt, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          })
          .then(async (response) => {
            const apiResultContent =
              response?.data?.response_text || response?.data;
            if (
              !apiResultContent ||
              (typeof apiResultContent === "string" &&
                apiResultContent.trim() === "")
            ) {
              console.warn(
                `[Worker ${jobId}] Extraction API returned empty or invalid content for ${documentType}`
              );
              throw new Error(
                "Extraction API returned empty or invalid content"
              );
            }

            extractedText =
              typeof apiResultContent === "string"
                ? apiResultContent
                : JSON.stringify(apiResultContent);
          });
      }
    } catch (error) {
      console.error("Error running RAG query:", error);
    }
  };

  return (
    <div className="rag-page">
      <h1>RAG Inference Page</h1>
      <p>
        This is the RAG inference page where you can interact with the RAG
        system.
      </p>
      {/* Add your RAG inference components here */}
      {handleQuery && (
        <div>
          <h2>Query RAG</h2>
          <input
            type="text"
            placeholder="Enter your query"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleQuery(e.target.value);
                e.target.value = ""; // Clear input after query
              }
            }}
          />
        </div>
      )}
      {extractedText && (
        <div>
          <h2>Extracted Text</h2>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default RAGPage;
