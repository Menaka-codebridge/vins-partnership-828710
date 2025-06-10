const assert = require("assert");
const app = require("../../src/app");

describe("caseDocuments service", () => {
  let thisService;
  let caseDocumentCreated;

  beforeEach(async () => {
    thisService = await app.service("caseDocuments");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (caseDocuments)");
  });

  describe("#create", () => {
    const options = {"caseNo":"aasdfasdfasdfadsfadfa","extractedContent":"new value","uploadTimestamp":1749577522157,"uploadedDocument":"new value"};

    beforeEach(async () => {
      caseDocumentCreated = await thisService.create(options);
    });

    it("should create a new caseDocument", () => {
      assert.strictEqual(caseDocumentCreated.caseNo, options.caseNo);
assert.strictEqual(caseDocumentCreated.extractedContent, options.extractedContent);
assert.strictEqual(caseDocumentCreated.uploadTimestamp, options.uploadTimestamp);
assert.strictEqual(caseDocumentCreated.uploadedDocument, options.uploadedDocument);
    });
  });

  describe("#get", () => {
    it("should retrieve a caseDocument by ID", async () => {
      const retrieved = await thisService.get(caseDocumentCreated._id);
      assert.strictEqual(retrieved._id, caseDocumentCreated._id);
    });
  });

  describe("#update", () => {
    let caseDocumentUpdated;
    const options = {"caseNo":"345345345345345345345","extractedContent":"updated value","uploadTimestamp":null,"uploadedDocument":"updated value"};

    beforeEach(async () => {
      caseDocumentUpdated = await thisService.update(caseDocumentCreated._id, options);
    });

    it("should update an existing caseDocument ", async () => {
      assert.strictEqual(caseDocumentUpdated.caseNo, options.caseNo);
assert.strictEqual(caseDocumentUpdated.extractedContent, options.extractedContent);
assert.strictEqual(caseDocumentUpdated.uploadTimestamp, options.uploadTimestamp);
assert.strictEqual(caseDocumentUpdated.uploadedDocument, options.uploadedDocument);
    });
  });

  describe("#delete", () => {
  let caseDocumentDeleted;
    beforeEach(async () => {
      caseDocumentDeleted = await thisService.remove(caseDocumentCreated._id);
    });

    it("should delete a caseDocument", async () => {
      assert.strictEqual(caseDocumentDeleted._id, caseDocumentCreated._id);
    });
  });
});