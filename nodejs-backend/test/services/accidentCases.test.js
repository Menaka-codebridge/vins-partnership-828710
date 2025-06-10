const assert = require("assert");
const app = require("../../src/app");

describe("accidentCases service", () => {
  let thisService;
  let accidentCaseCreated;

  beforeEach(async () => {
    thisService = await app.service("accidentCases");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (accidentCases)");
  });

  describe("#create", () => {
    const options = {"insuranceRef":"new value","caseNo":"new value","court":"new value","plaintiffSolicitors":"new value","plaintiff":"new value","insuredDriver":"new value","insured":"new value","insuredVehicle":"new value","collisionDateTime":1749577521865,"claimStatus":"new value","user":"aasdfasdfasdfadsfadfa","synonyms":"new value","parameters":"new value"};

    beforeEach(async () => {
      accidentCaseCreated = await thisService.create(options);
    });

    it("should create a new accidentCase", () => {
      assert.strictEqual(accidentCaseCreated.insuranceRef, options.insuranceRef);
assert.strictEqual(accidentCaseCreated.caseNo, options.caseNo);
assert.strictEqual(accidentCaseCreated.court, options.court);
assert.strictEqual(accidentCaseCreated.plaintiffSolicitors, options.plaintiffSolicitors);
assert.strictEqual(accidentCaseCreated.plaintiff, options.plaintiff);
assert.strictEqual(accidentCaseCreated.insuredDriver, options.insuredDriver);
assert.strictEqual(accidentCaseCreated.insured, options.insured);
assert.strictEqual(accidentCaseCreated.insuredVehicle, options.insuredVehicle);
assert.strictEqual(accidentCaseCreated.collisionDateTime, options.collisionDateTime);
assert.strictEqual(accidentCaseCreated.claimStatus, options.claimStatus);
assert.strictEqual(accidentCaseCreated.user, options.user);
assert.strictEqual(accidentCaseCreated.synonyms, options.synonyms);
assert.strictEqual(accidentCaseCreated.parameters, options.parameters);
    });
  });

  describe("#get", () => {
    it("should retrieve a accidentCase by ID", async () => {
      const retrieved = await thisService.get(accidentCaseCreated._id);
      assert.strictEqual(retrieved._id, accidentCaseCreated._id);
    });
  });

  describe("#update", () => {
    let accidentCaseUpdated;
    const options = {"insuranceRef":"updated value","caseNo":"updated value","court":"updated value","plaintiffSolicitors":"updated value","plaintiff":"updated value","insuredDriver":"updated value","insured":"updated value","insuredVehicle":"updated value","collisionDateTime":null,"claimStatus":"updated value","user":"345345345345345345345","synonyms":"updated value","parameters":"updated value"};

    beforeEach(async () => {
      accidentCaseUpdated = await thisService.update(accidentCaseCreated._id, options);
    });

    it("should update an existing accidentCase ", async () => {
      assert.strictEqual(accidentCaseUpdated.insuranceRef, options.insuranceRef);
assert.strictEqual(accidentCaseUpdated.caseNo, options.caseNo);
assert.strictEqual(accidentCaseUpdated.court, options.court);
assert.strictEqual(accidentCaseUpdated.plaintiffSolicitors, options.plaintiffSolicitors);
assert.strictEqual(accidentCaseUpdated.plaintiff, options.plaintiff);
assert.strictEqual(accidentCaseUpdated.insuredDriver, options.insuredDriver);
assert.strictEqual(accidentCaseUpdated.insured, options.insured);
assert.strictEqual(accidentCaseUpdated.insuredVehicle, options.insuredVehicle);
assert.strictEqual(accidentCaseUpdated.collisionDateTime, options.collisionDateTime);
assert.strictEqual(accidentCaseUpdated.claimStatus, options.claimStatus);
assert.strictEqual(accidentCaseUpdated.user, options.user);
assert.strictEqual(accidentCaseUpdated.synonyms, options.synonyms);
assert.strictEqual(accidentCaseUpdated.parameters, options.parameters);
    });
  });

  describe("#delete", () => {
  let accidentCaseDeleted;
    beforeEach(async () => {
      accidentCaseDeleted = await thisService.remove(accidentCaseCreated._id);
    });

    it("should delete a accidentCase", async () => {
      assert.strictEqual(accidentCaseDeleted._id, accidentCaseCreated._id);
    });
  });
});