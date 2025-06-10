const { createJobQueWorker2 } = require('./processJobQueues');

// const { createDynaLoaderQueWorker } = require('./processDynaLoaderQues');
const {
  createChangeForgotPasswordQueWorker,
} = require('./processChangeForgotPasswordQue');
const { createMailQueWorker } = require('./processEmails');
const { createUserProfile } = require('./processCreateUserProfile');
const { createUploader } = require('./processUploader');

const createWorker = (app) => {
  createJobQueWorker2(app);
  createMailQueWorker(app);
  createChangeForgotPasswordQueWorker(app);
  createUserProfile(app);
  createUploader(app);
};

module.exports = createWorker;
