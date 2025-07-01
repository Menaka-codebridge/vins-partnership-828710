module.exports = function (app) {
  const modelName = "company_position_mappings";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      company: {
        type: Schema.Types.ObjectId,
        ref: "companies",
        comment:
          "Company, dropdown, false, true, true, true, true, true, true, companies, companies, one-to-one, name,",
      },
      position: [
        {
          type: Schema.Types.ObjectId,
          ref: "positions",
          comment:
            "Positions, dropdown, false, true, true, true, true, true, true, positions, positions, one-to-many, name,",
        },
      ],
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
