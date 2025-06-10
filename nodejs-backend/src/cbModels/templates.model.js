module.exports = function (app) {
  const modelName = "templates";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        index: true,
        trim: true,
        comment: "Name, p, false, true, true, true, true, true, true, , , , ,",
      },
      subject: {
        type: String,
        index: true,
        trim: true,
        comment:
          "Subject, inputTextarea, false, true, true, true, true, true, true, , , , ,",
      },
      body: {
        type: String,
        index: true,
        trim: true,
        comment:
          "Body, inputTextarea, false, true, true, true, true, true, true, , , , ,",
      },
      variables: {
        type: [String],
        trim: true,
        comment:
          "Variables, inputTextarea, false, true, true, true, true, true, true, , , , ,",
      },
      image: {
        type: String,
        trim: true,
        comment:
          "Image, image, false, true, true, true, true, true, true, , , , ,",
      },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
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
