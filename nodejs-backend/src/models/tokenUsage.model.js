module.exports = function (app) {
  const modelName = "token_usage";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      jobId: { type: String, required: true },
      sectionContentId: {
        type: Schema.Types.ObjectId,
        ref: "section_contents",
      },
      promptQueueId: { type: Schema.Types.ObjectId, ref: "prompt_queues" },
      summonsNo: { type: Schema.Types.ObjectId, ref: "accident_cases" },
      section: { type: String },
      subsection: { type: String },
      inputTokens: { type: Number, required: true },
      outputTokens: { type: Number, required: true },
      totalTokens: { type: Number, required: true },
      modelId: {
        type: String,
        default: "anthropic.claude-3-opus-20240229-v1:0",
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    {
      timestamps: true,
    },
  );

  schema.index({ jobId: 1 });
  schema.index({ sectionContentId: 1 });
  schema.index({ promptQueueId: 1 });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
