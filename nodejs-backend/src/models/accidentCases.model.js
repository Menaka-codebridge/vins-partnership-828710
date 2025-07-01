module.exports = function (app) {
  const modelName = "accident_cases";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      insuranceRef: { type: String, required: true },
      vinsPartnershipReference: { type: String, required: true },
      summonsNo: { type: String, required: true },
      court: { type: String, required: true },
      plaintiffSolicitors: { type: String, required: true },
      plaintiff: { type: String, required: true },
      insuredDriver: { type: String, required: true },
      insured: { type: String, required: true },
      insuredVehicle: { type: String, required: true },
      collisionDateTime: { type: Date, required: true },
      claimStatus: { type: String, required: true },
      claimStatusDate: { type: Date, required: true },
      typeOfClaims: { type: String }, 
      recipientName: { type: String }, 
      recipientDepartment: { type: String }, 
      caseDetails: [
        {
          type: Schema.Types.Mixed,
          default: [],
        },
      ],
      user: { type: Schema.Types.ObjectId, ref: "users" },
      synonyms: {
        type: [
          {
            primary: { type: String, required: true },
            synonymsList: [{ type: String }],
          },
        ],
        required: false,
      },
      parameters: {
        type: {
          modelId: { type: String },
          max_tokens: { type: Number },
          temperature: { type: Number },
          top_k: { type: Number },
          top_p: { type: Number },
          stop_sequences: [{ type: String }],
        },
        required: false,
      },
      sectionContents: [
        { type: Schema.Types.ObjectId, ref: "section_contents" },
      ],
      documentContent: [
        {
          type: Schema.Types.Mixed,
          default: [],
        },
      ],
      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    {
      timestamps: true,
    },
  );

  // Indexes for performance
  schema.index({ summonsNo: 1 });
  schema.index({ user: 1 });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
