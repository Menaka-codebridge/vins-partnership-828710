const assert = require("assert");
const app = require("../../src/app");

describe("histories service", () => {
  let thisService;
  let historyCreated;

  beforeEach(async () => {
    thisService = await app.service("histories");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (histories)");
  });

  describe("#create", () => {
    const options = {"caseNo":"aasdfasdfasdfadsfadfa","users":"aasdfasdfasdfadsfadfa","timestamp":1749577522315,"userPrompt":"new value","parametersUsed":"new value","synonymsUsed":"new value","responseReceived":"new value","section":"new value","subSection":"new value"};

    beforeEach(async () => {
      historyCreated = await thisService.create(options);
    });

    it("should create a new history", () => {
      assert.strictEqual(historyCreated.caseNo, options.caseNo);
assert.strictEqual(historyCreated.users, options.users);
assert.strictEqual(historyCreated.timestamp, options.timestamp);
assert.strictEqual(historyCreated.userPrompt, options.userPrompt);
assert.strictEqual(historyCreated.parametersUsed, options.parametersUsed);
assert.strictEqual(historyCreated.synonymsUsed, options.synonymsUsed);
assert.strictEqual(historyCreated.responseReceived, options.responseReceived);
assert.strictEqual(historyCreated.section, options.section);
assert.strictEqual(historyCreated.subSection, options.subSection);
    });
  });

  describe("#get", () => {
    it("should retrieve a history by ID", async () => {
      const retrieved = await thisService.get(historyCreated._id);
      assert.strictEqual(retrieved._id, historyCreated._id);
    });
  });

  describe("#update", () => {
    let historyUpdated;
    const options = {"caseNo":"345345345345345345345","users":"345345345345345345345","timestamp":null,"userPrompt":"updated value","parametersUsed":"updated value","synonymsUsed":"updated value","responseReceived":"updated value","section":"updated value","subSection":"updated value"};

    beforeEach(async () => {
      historyUpdated = await thisService.update(historyCreated._id, options);
    });

    it("should update an existing history ", async () => {
      assert.strictEqual(historyUpdated.caseNo, options.caseNo);
assert.strictEqual(historyUpdated.users, options.users);
assert.strictEqual(historyUpdated.timestamp, options.timestamp);
assert.strictEqual(historyUpdated.userPrompt, options.userPrompt);
assert.strictEqual(historyUpdated.parametersUsed, options.parametersUsed);
assert.strictEqual(historyUpdated.synonymsUsed, options.synonymsUsed);
assert.strictEqual(historyUpdated.responseReceived, options.responseReceived);
assert.strictEqual(historyUpdated.section, options.section);
assert.strictEqual(historyUpdated.subSection, options.subSection);
    });
  });

  describe("#delete", () => {
  let historyDeleted;
    beforeEach(async () => {
      historyDeleted = await thisService.remove(historyCreated._id);
    });

    it("should delete a history", async () => {
      assert.strictEqual(historyDeleted._id, historyCreated._id);
    });
  });
});