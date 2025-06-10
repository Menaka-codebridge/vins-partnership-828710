const assert = require("assert");
const app = require("../../src/app");

describe("sectionContents service", () => {
  let thisService;
  let sectionContentCreated;

  beforeEach(async () => {
    thisService = await app.service("sectionContents");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (sectionContents)");
  });

  describe("#create", () => {
    const options = {"caseNo":"aasdfasdfasdfadsfadfa","section":"new value","subsection":"new value","initialInference":"new value","groundTruth":"new value","promptUsed":"new value","status":"new value"};

    beforeEach(async () => {
      sectionContentCreated = await thisService.create(options);
    });

    it("should create a new sectionContent", () => {
      assert.strictEqual(sectionContentCreated.caseNo, options.caseNo);
assert.strictEqual(sectionContentCreated.section, options.section);
assert.strictEqual(sectionContentCreated.subsection, options.subsection);
assert.strictEqual(sectionContentCreated.initialInference, options.initialInference);
assert.strictEqual(sectionContentCreated.groundTruth, options.groundTruth);
assert.strictEqual(sectionContentCreated.promptUsed, options.promptUsed);
assert.strictEqual(sectionContentCreated.status, options.status);
    });
  });

  describe("#get", () => {
    it("should retrieve a sectionContent by ID", async () => {
      const retrieved = await thisService.get(sectionContentCreated._id);
      assert.strictEqual(retrieved._id, sectionContentCreated._id);
    });
  });

  describe("#update", () => {
    let sectionContentUpdated;
    const options = {"caseNo":"345345345345345345345","section":"updated value","subsection":"updated value","initialInference":"updated value","groundTruth":"updated value","promptUsed":"updated value","status":"updated value"};

    beforeEach(async () => {
      sectionContentUpdated = await thisService.update(sectionContentCreated._id, options);
    });

    it("should update an existing sectionContent ", async () => {
      assert.strictEqual(sectionContentUpdated.caseNo, options.caseNo);
assert.strictEqual(sectionContentUpdated.section, options.section);
assert.strictEqual(sectionContentUpdated.subsection, options.subsection);
assert.strictEqual(sectionContentUpdated.initialInference, options.initialInference);
assert.strictEqual(sectionContentUpdated.groundTruth, options.groundTruth);
assert.strictEqual(sectionContentUpdated.promptUsed, options.promptUsed);
assert.strictEqual(sectionContentUpdated.status, options.status);
    });
  });

  describe("#delete", () => {
  let sectionContentDeleted;
    beforeEach(async () => {
      sectionContentDeleted = await thisService.remove(sectionContentCreated._id);
    });

    it("should delete a sectionContent", async () => {
      assert.strictEqual(sectionContentDeleted._id, sectionContentCreated._id);
    });
  });
});