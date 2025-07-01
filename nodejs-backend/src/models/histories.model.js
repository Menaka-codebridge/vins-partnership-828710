module.exports = function (app) {
  const modelName = "histories";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      summonsNo: { type: Schema.Types.ObjectId, ref: "accident_cases" },
      users: { type: Schema.Types.ObjectId, ref: "users" },
      timestamp: { type: Date, required: false },
      userPrompt: { type: String, required: true },
      parametersUsed: { type: String, required: true },
      synonymsUsed: { type: String, required: true },
      responseReceived: { type: String, required: true },
      section: { type: String, required: true },
      subSection: { type: String, required: true },

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
