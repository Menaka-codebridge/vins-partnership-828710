module.exports = function (app) {
  const modelName = "prompt_queues";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      sectionContentId: {
        type: Schema.Types.ObjectId,
        ref: "section_contents",
      },
      summonsNo: { type: Schema.Types.ObjectId, ref: "accident_cases" },
      promptUsed: { type: String, required: true },
      status: { type: String, required: true },
      errorMessage: { type: String, required: false },

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
