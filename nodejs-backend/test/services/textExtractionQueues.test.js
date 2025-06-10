const assert = require("assert");
const app = require("../../src/app");

describe("textExtractionQueues service", () => {
  let thisService;
  let textExtractionQueueCreated;

  beforeEach(async () => {
    thisService = await app.service("textExtractionQueues");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (textExtractionQueues)");
  });

  describe("#create", () => {
    const options = {"caseDocumentId":"aasdfasdfasdfadsfadfa","documentStorageId":"aasdfasdfasdfadsfadfa","documentType":"new value","caseNo":"aasdfasdfasdfadsfadfa"};

    beforeEach(async () => {
      textExtractionQueueCreated = await thisService.create(options);
    });

    it("should create a new textExtractionQueue", () => {
      assert.strictEqual(textExtractionQueueCreated.caseDocumentId, options.caseDocumentId);
assert.strictEqual(textExtractionQueueCreated.documentStorageId, options.documentStorageId);
assert.strictEqual(textExtractionQueueCreated.documentType, options.documentType);
assert.strictEqual(textExtractionQueueCreated.caseNo, options.caseNo);
    });
  });

  describe("#get", () => {
    it("should retrieve a textExtractionQueue by ID", async () => {
      const retrieved = await thisService.get(textExtractionQueueCreated._id);
      assert.strictEqual(retrieved._id, textExtractionQueueCreated._id);
    });
  });

  describe("#update", () => {
    let textExtractionQueueUpdated;
    const options = {"caseDocumentId":"345345345345345345345","documentStorageId":"345345345345345345345","documentType":"updated value","caseNo":"345345345345345345345"};

    beforeEach(async () => {
      textExtractionQueueUpdated = await thisService.update(textExtractionQueueCreated._id, options);
    });

    it("should update an existing textExtractionQueue ", async () => {
      assert.strictEqual(textExtractionQueueUpdated.caseDocumentId, options.caseDocumentId);
assert.strictEqual(textExtractionQueueUpdated.documentStorageId, options.documentStorageId);
assert.strictEqual(textExtractionQueueUpdated.documentType, options.documentType);
assert.strictEqual(textExtractionQueueUpdated.caseNo, options.caseNo);
    });
  });

  describe("#delete", () => {
  let textExtractionQueueDeleted;
    beforeEach(async () => {
      textExtractionQueueDeleted = await thisService.remove(textExtractionQueueCreated._id);
    });

    it("should delete a textExtractionQueue", async () => {
      assert.strictEqual(textExtractionQueueDeleted._id, textExtractionQueueCreated._id);
    });
  });
});