
    module.exports = function (app) {
        const modelName = "accident_cases";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            insuranceRef: { type:  String , required: true, comment: "Insurance Ref, p, false, true, true, true, true, true, true, , , , ," },
caseNo: { type:  String , required: true, comment: "Case No, p, false, true, true, true, true, true, true, , , , ," },
court: { type:  String , required: true, comment: "Court, p, false, true, true, true, true, true, true, , , , ," },
plaintiffSolicitors: { type:  String , required: true, comment: "Plaintiff Solicitors, p, false, true, true, true, true, true, true, , , , ," },
plaintiff: { type:  String , required: true, comment: "Plaintiff, p, false, true, true, true, true, true, true, , , , ," },
insuredDriver: { type:  String , required: true, comment: "Insured Driver, p, false, true, true, true, true, true, true, , , , ," },
insured: { type:  String , required: true, comment: "Insured, p, false, true, true, true, true, true, true, , , , ," },
insuredVehicle: { type:  String , required: true, comment: "Insured Vehicle, p, false, true, true, true, true, true, true, , , , ," },
collisionDateTime: { type: Date, comment: "Collision Date Time, p_calendar, false, true, true, true, true, true, true, , , , ," },
claimStatus: { type:  String , required: true, comment: "ClaimStatus, p, false, true, true, true, true, true, true, , , , ," },
user: { type: Schema.Types.ObjectId, ref: "users", comment: "User, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name," },
synonyms: { type:  String , required: true, comment: "Synonyms, p, false, true, true, true, true, true, true, , , , ," },
parameters: { type:  String , required: true, comment: "Parameters, p, false, true, true, true, true, true, true, , , , ," },

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