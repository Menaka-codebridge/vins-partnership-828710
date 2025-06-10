module.exports = function (app) {
  const modelName = "permission_services";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      service: {
        type: String,
        minLength: 3,
        maxLength: 1000000,
        index: true,
        trim: true,
        comment:
          "Service, p, false, true, true, true, true, true, true, , , , ,",
      },
      // create: {
      //   type: Boolean,
      //   required: false,
      //   default: true,
      //   comment:
      //     'Create, p_boolean, false, true, true, true, true, true, true, , , , ,',
      // },
      // read: {
      //   type: String,
      //   enum: ['all', 'own', 'subordinates'],
      //   comment: 'Read, p, false, true, true, true, true, true, true, , , , ,',
      // },
      // update: {
      //   type: String,
      //   enum: ['all', 'own', 'subordinate'],
      //   comment:
      //     'Update, p, false, true, true, true, true, true, true, , , , ,',
      // },
      // delete: {
      //   type: String,
      //   enum: ['all', 'own', 'subordinate'],
      //   comment:
      //     'Delete, p, false, true, true, true, true, true, true, , , , ,',
      // },
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      import: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      seeder: { type: Boolean, default: false },
      profile: {
        type: Schema.Types.ObjectId,
        ref: "profiles",
        comment:
          "Profile, dropdown, false, true, true, true, true, true, true, profiles, profiles, one-to-one, name,",
      },
      roleId: {
        type: Schema.Types.ObjectId,
        ref: "roles",
        comment:
          "RoleId, dropdown, false, true, true, true, true, true, true, roles, roles, one-to-one, name,",
      },
      positionId: {
        type: Schema.Types.ObjectId,
        ref: "positions",
        comment:
          "PositionId, dropdown, false, true, true, true, true, true, true, positions, positions, one-to-one, name,",
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        comment:
          "UserId, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,",
      },
      roles: [{ type: Schema.Types.ObjectId, ref: "roles" }],
      positions: [{ type: Schema.Types.ObjectId, ref: "positions" }],
      profiles: [{ type: Schema.Types.ObjectId, ref: "profiles" }],

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
