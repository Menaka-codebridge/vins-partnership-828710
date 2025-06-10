
    module.exports = function (app) {
        const modelName = "ground_truth_queues";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            caseDocumentId: { type: Schema.Types.ObjectId, ref: "case_documents", comment: "Case Document Id, dropdown, false, true, true, true, true, true, true, caseDocuments, case_documents, one-to-one, caseNo," },
caseNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Case No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, caseNo," },
status: { type:  String , required: true, comment: "Status, p, false, true, true, true, true, true, true, , , , ," },
errorMessage: { type:  String , required: true, comment: "Error Message, p, false, true, true, true, true, true, true, , , , ," },

            createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true }
          },
          {
            timestamps: true
        });
      
       
        if (mongooseClient.modelNames().includes(modelName)) {
          mongooseClient.deleteModel(modelName);
        }
        return mongooseClient.model(modelName, schema);
        
      };