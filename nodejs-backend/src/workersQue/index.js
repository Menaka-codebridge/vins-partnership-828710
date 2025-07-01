const { createJobQueWorker } = require("./processJobQueues");
// const { createDynaLoaderQueWorker } = require('./processDynaLoaderQues');
const {
  createChangeForgotPasswordQueWorker,
} = require("./processChangeForgotPasswordQue");
const { createMailQueWorker } = require("./processEmails");
const { createUserProfile } = require("./processCreateUserProfile");
const { createUploader } = require("./processUploader");
const {
  createTextExtractionWorker,
} = require("./processTextExtractionQueues-V2");
const { createInferenceWorker } = require("./processInferenceQueues-V2");
const { createPromptQueueWorker } = require("./PromptQueueWorker");

const createWorker = (app) => {
  createJobQueWorker(app);
  createMailQueWorker(app);
  createChangeForgotPasswordQueWorker(app);
  createUserProfile(app);
  createUploader(app);
  createTextExtractionWorker(app);
  createInferenceWorker(app);
  createPromptQueueWorker(app);
};

module.exports = createWorker;
