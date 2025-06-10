
    module.exports = function (app) {
        const modelName = "case_documents";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            caseNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Case No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, caseNo," },
extractedContent: { type:  String , required: true, comment: "Extracted Content, p, false, true, true, true, true, true, true, , , , ," },
uploadTimestamp: { type: Date, comment: "UploadTimestamp, p_calendar, false, true, true, true, true, true, true, , , , ," },
uploadedDocument: { type:  [Schema.Types.ObjectId], ref: "document_storages" , required: true, comment: "Uploaded Document, file_upload, false, true, true, true, true, true, true, , , , ," },

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