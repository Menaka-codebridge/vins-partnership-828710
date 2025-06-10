
    module.exports = function (app) {
        const modelName = "text_extraction_queues";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            caseDocumentId: { type: Schema.Types.ObjectId, ref: "case_documents", comment: "Case Document Id, dropdown, false, true, true, true, true, true, true, caseDocuments, case_documents, one-to-one, caseNo," },
documentStorageId: { type: Schema.Types.ObjectId, ref: "case_documents", comment: "Document Storage Id, dropdown, false, true, true, true, true, true, true, caseDocuments, case_documents, one-to-one, caseNo," },
documentType: { type:  String , required: true, comment: "Document Type, p, false, true, true, true, true, true, true, , , , ," },
caseNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Case No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, caseNo," },

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