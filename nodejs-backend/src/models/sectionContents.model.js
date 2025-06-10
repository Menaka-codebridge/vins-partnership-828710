
    module.exports = function (app) {
        const modelName = "section_contents";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            caseNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Case No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, caseNo," },
section: { type:  String , required: true, comment: "Section, p, false, true, true, true, true, true, true, , , , ," },
subsection: { type:  String , required: true, comment: "Subsection, p, false, true, true, true, true, true, true, , , , ," },
initialInference: { type:  String , required: true, comment: "Initial Inference, p, false, true, true, true, true, true, true, , , , ," },
groundTruth: { type:  String , required: true, comment: "Ground Truth, p, false, true, true, true, true, true, true, , , , ," },
promptUsed: { type:  String , required: true, comment: "Promp Used, p, false, true, true, true, true, true, true, , , , ," },
status: { type:  String , required: true, comment: "Status, p, false, true, true, true, true, true, true, , , , ," },

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