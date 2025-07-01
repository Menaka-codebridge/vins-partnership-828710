const accidentCases = require("./accidentCases/accidentCases.service.js");
const sectionContents = require("./sectionContents/sectionContents.service.js");
const caseDocuments = require("./caseDocuments/caseDocuments.service.js");
const histories = require("./histories/histories.service.js");
const textExtractionQueues = require("./textExtractionQueues/textExtractionQueues.service.js");
const groundTruthQueues = require("./groundTruthQueues/groundTruthQueues.service.js");
const promptQueues = require("./promptQueues/promptQueues.service.js");
const llmPromptCalls = require("./llmPromptCalls/llmPromptCalls.service.js");
const tokenUsage = require("./tokenUsage/tokenUsage.service.js");
// ~cb-add-require-service-name~

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(accidentCases);
  app.configure(sectionContents);
  app.configure(caseDocuments);
  app.configure(histories);
  app.configure(textExtractionQueues);
  app.configure(groundTruthQueues);
  app.configure(promptQueues);
  app.configure(llmPromptCalls);
  app.configure(tokenUsage);
  // ~cb-add-configure-service-name~
};
