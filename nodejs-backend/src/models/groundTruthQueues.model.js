module.exports = function (app) {
  const modelName = "ground_truth_queues";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      caseDocumentId: {
        type: Schema.Types.ObjectId,
        ref: "case_documents",
        required: true,
      },
      summonsNo: {
        type: Schema.Types.ObjectId,
        ref: "accident_cases",
        required: true,
      },
      status: {
        type: String,
        required: true,
        enum: ["queued", "processing", "completed", "failed"],
        default: "queued",
      },
      errorMessage: {
        type: String,
        required: false,
      },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
