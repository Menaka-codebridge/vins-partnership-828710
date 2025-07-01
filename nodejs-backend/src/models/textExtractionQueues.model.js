module.exports = function (app) {
  const modelName = "text_extraction_queues";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      caseDocumentId: {
        type: Schema.Types.ObjectId,
        ref: "case_documents",
        index: true,
      },
      documentStorageId: {
        type: Schema.Types.ObjectId,
        ref: "document_storages",
      },
      documentType: { type: String, required: true },
      summonsNo: {
        type: Schema.Types.ObjectId,
        ref: "accident_cases",
        index: true,
      },

      status: {
        type: String,
        default: "queued",
        enum: ["queued", "processing", "completed", "failed", "queue_failed"],
        index: true,
      },
      errorMessage: { type: String },

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
