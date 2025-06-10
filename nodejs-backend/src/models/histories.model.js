
    module.exports = function (app) {
        const modelName = "histories";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            caseNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Case No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, caseNo," },
users: { type: Schema.Types.ObjectId, ref: "users", comment: "Users, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name," },
timestamp: { type: Date, comment: "Timestamp, p_calendar, false, true, true, true, true, true, true, , , , ," },
userPrompt: { type:  String , required: true, comment: "User Prompt, p, false, true, true, true, true, true, true, , , , ," },
parametersUsed: { type:  String , required: true, comment: "Parameters Used, p, false, true, true, true, true, true, true, , , , ," },
synonymsUsed: { type:  String , required: true, comment: "Synonyms Used, p, false, true, true, true, true, true, true, , , , ," },
responseReceived: { type:  String , required: true, comment: "Response Received, p, false, true, true, true, true, true, true, , , , ," },
section: { type:  String , required: true, comment: "Section, p, false, true, true, true, true, true, true, , , , ," },
subSection: { type:  String , required: true, comment: "Sub Section, p, false, true, true, true, true, true, true, , , , ," },

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