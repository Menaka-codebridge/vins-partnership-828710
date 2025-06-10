const assert = require("assert");
const app = require("../../src/app");

describe("groundTruthQueues service", () => {
  let thisService;
  let groundTruthQueueCreated;

  beforeEach(async () => {
    thisService = await app.service("groundTruthQueues");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (groundTruthQueues)");
  });

  describe("#create", () => {
    const options = {"caseDocumentId":"aasdfasdfasdfadsfadfa","caseNo":"aasdfasdfasdfadsfadfa","status":"new value","errorMessage":"new value"};

    beforeEach(async () => {
      groundTruthQueueCreated = await thisService.create(options);
    });

    it("should create a new groundTruthQueue", () => {
      assert.strictEqual(groundTruthQueueCreated.caseDocumentId, options.caseDocumentId);
assert.strictEqual(groundTruthQueueCreated.caseNo, options.caseNo);
assert.strictEqual(groundTruthQueueCreated.status, options.status);
assert.strictEqual(groundTruthQueueCreated.errorMessage, options.errorMessage);
    });
  });

  describe("#get", () => {
    it("should retrieve a groundTruthQueue by ID", async () => {
      const retrieved = await thisService.get(groundTruthQueueCreated._id);
      assert.strictEqual(retrieved._id, groundTruthQueueCreated._id);
    });
  });

  describe("#update", () => {
    let groundTruthQueueUpdated;
    const options = {"caseDocumentId":"345345345345345345345","caseNo":"345345345345345345345","status":"updated value","errorMessage":"updated value"};

    beforeEach(async () => {
      groundTruthQueueUpdated = await thisService.update(groundTruthQueueCreated._id, options);
    });

    it("should update an existing groundTruthQueue ", async () => {
      assert.strictEqual(groundTruthQueueUpdated.caseDocumentId, options.caseDocumentId);
assert.strictEqual(groundTruthQueueUpdated.caseNo, options.caseNo);
assert.strictEqual(groundTruthQueueUpdated.status, options.status);
assert.strictEqual(groundTruthQueueUpdated.errorMessage, options.errorMessage);
    });
  });

  describe("#delete", () => {
  let groundTruthQueueDeleted;
    beforeEach(async () => {
      groundTruthQueueDeleted = await thisService.remove(groundTruthQueueCreated._id);
    });

    it("should delete a groundTruthQueue", async () => {
      assert.strictEqual(groundTruthQueueDeleted._id, groundTruthQueueCreated._id);
    });
  });
});