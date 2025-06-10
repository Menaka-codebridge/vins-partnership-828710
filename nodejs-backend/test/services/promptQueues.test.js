const assert = require("assert");
const app = require("../../src/app");

describe("promptQueues service", () => {
  let thisService;
  let promptQueueCreated;

  beforeEach(async () => {
    thisService = await app.service("promptQueues");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (promptQueues)");
  });

  describe("#create", () => {
    const options = {"sectionContentId":"aasdfasdfasdfadsfadfa","summonsNo":"aasdfasdfasdfadsfadfa","promptUsed":"new value","status":"new value","errorMessage":"new value"};

    beforeEach(async () => {
      promptQueueCreated = await thisService.create(options);
    });

    it("should create a new promptQueue", () => {
      assert.strictEqual(promptQueueCreated.sectionContentId, options.sectionContentId);
assert.strictEqual(promptQueueCreated.summonsNo, options.summonsNo);
assert.strictEqual(promptQueueCreated.promptUsed, options.promptUsed);
assert.strictEqual(promptQueueCreated.status, options.status);
assert.strictEqual(promptQueueCreated.errorMessage, options.errorMessage);
    });
  });

  describe("#get", () => {
    it("should retrieve a promptQueue by ID", async () => {
      const retrieved = await thisService.get(promptQueueCreated._id);
      assert.strictEqual(retrieved._id, promptQueueCreated._id);
    });
  });

  describe("#update", () => {
    let promptQueueUpdated;
    const options = {"sectionContentId":"345345345345345345345","summonsNo":"345345345345345345345","promptUsed":"updated value","status":"updated value","errorMessage":"updated value"};

    beforeEach(async () => {
      promptQueueUpdated = await thisService.update(promptQueueCreated._id, options);
    });

    it("should update an existing promptQueue ", async () => {
      assert.strictEqual(promptQueueUpdated.sectionContentId, options.sectionContentId);
assert.strictEqual(promptQueueUpdated.summonsNo, options.summonsNo);
assert.strictEqual(promptQueueUpdated.promptUsed, options.promptUsed);
assert.strictEqual(promptQueueUpdated.status, options.status);
assert.strictEqual(promptQueueUpdated.errorMessage, options.errorMessage);
    });
  });

  describe("#delete", () => {
  let promptQueueDeleted;
    beforeEach(async () => {
      promptQueueDeleted = await thisService.remove(promptQueueCreated._id);
    });

    it("should delete a promptQueue", async () => {
      assert.strictEqual(promptQueueDeleted._id, promptQueueCreated._id);
    });
  });
});