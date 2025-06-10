
    module.exports = function (app) {
        const modelName = "prompt_queues";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            sectionContentId: { type: Schema.Types.ObjectId, ref: "section_contents", comment: "Section Content Id, dropdown, false, true, true, true, true, true, true, sectionContents, section_contents, one-to-one, subsection," },
summonsNo: { type: Schema.Types.ObjectId, ref: "accident_cases", comment: "Summons No, dropdown, false, true, true, true, true, true, true, accidentCases, accident_cases, one-to-one, insuranceRef," },
promptUsed: { type:  String , required: true, comment: "Prompt Used, p, false, true, true, true, true, true, true, , , , ," },
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