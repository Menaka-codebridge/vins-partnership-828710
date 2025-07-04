module.exports = function (app) {
  const modelName = "accident_cases";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      insuranceRef: { type: String, required: true },
      vinsPartnershipReference: { type: String, required: true },
      summonsNo: { type: String, required: true },
      court: { type: String, },
      plaintiffSolicitors: { type: String, },
      plaintiff: { type: String, },
      insuredDriver: { type: String, },
      insured: { type: String, },
      insuredVehicle: { type: String, },
      collisionDateTime: { type: Date, },
      claimStatus: { type: String, },
      claimStatusDate: { type: Date, },
      typeOfClaims: { type: String },
      recipientName: { type: String },
      recipientDepartment: { type: String },
       partners: [{ type: String }],
      legalAssistants: [{ type: String }],
      insuranceCompany: { type: String },
      additionalInfoDate: { type: Date },
      additionalRecipient: { type: String },
      caseDetails: [
        {
          label: { type: String, required: true },
          fields: [
            {
              key: { type: String, required: true },
              value: { type: Schema.Types.Mixed },
              type: { type: String, required: true },
            },
          ],
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
