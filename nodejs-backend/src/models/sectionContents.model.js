module.exports = function (app) {
  const modelName = "section_contents";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      summonsNo: { type: Schema.Types.ObjectId, ref: "accident_cases" },
      section: { type: String, required: true },
      subsection: { type: String, required: false },
      order: { type: Number, required: false },
      initialInference: { type: String, required: false },
      inferenceStatement: { type: String, required: false },
      groundTruth: { type: String, required: false },
      retrievedFrom: { type: String, required: false },
      promptUsed: { type: String, required: false },
      confusionMatrix: { type: String, required: false },
      conclusion: { type: String, required: false },
      status: { type: String, required: false, default: "Draft" },
      llmPrompts: { type: Schema.Types.ObjectId, ref: "llm_prompt_calls" },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    {
      timestamps: true,
    },
  );
  // Optional: Add compound index
  schema.index({ summonsNo: 1, section: 1, subsection: 1 });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
