module.exports = function (app) {
  const modelName = "llm_prompt_calls";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: {
      type: String,
    },
    collectionName: {
      type: String,
    },
    collectionId: {
      type: String,
    },
    section: {
      type: String,
      required: true,
    },
    subsection: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
