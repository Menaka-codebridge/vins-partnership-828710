module.exports = function (app) {
  const modelName = "case_documents";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      summonsNo: {
        type: Schema.Types.ObjectId,
        ref: "accident_cases",
        required: true,
      },
      documentType: { type: String, required: false },
      extractedContent: { type: String, required: false },
      uploadTimestamp: { type: Date, required: false, default: Date.now },
      uploadedDocument: {
        type: [Schema.Types.ObjectId],
        ref: "document_storages",
        required: true,
      },
      extractedDocument: { type: Schema.Types.Mixed },
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
