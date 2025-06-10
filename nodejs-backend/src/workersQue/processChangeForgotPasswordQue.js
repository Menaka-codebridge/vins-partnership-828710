const { Queue, Worker } = require("bullmq");
const connection = require("../services/redis/config");
const { decryptData, encryptData } = require("../utils/encryption");

const jobQueue = new Queue("jobUserChangeForgotPassword", { connection });

const createChangeForgotPasswordQueWorker = (app) => {
  let user;
  const worker = new Worker(
    "jobUserChangeForgotPassword",
    async (job) => {
      const { data } = job;
      console.log("decrypted data in worker", data)
      if (data.userEmail) {
        const userData = await app
          .service("users")
          .find({ query: { email: data.userEmail } });
        user = userData.data[0];
        // if (user && user.status === true) {
        //   await app
        //     .service("userChangePassword")
        //     .patch(data._id, { status: true });
        // } else if (user && user.status === false) {
        //   throw Error(`User email ${data.userEmail} not registered.`);
        // } else throw Error(`User email ${data.userEmail} not found.`);
      } else throw Error(`User email ${data.userEmail} empty.`);
    },
    { connection },
  );

  // Event listeners for worker
  worker.on("completed", async (job) => {
    console.debug(`Job forgot password ${job.id} completed successfully`);
    if (job.data) {
      try {
        const clientUrl = `${job.data.server}reset/${job.data._id}`;
        console.debug("job.data.server", job.data.server);
        const _mail = {
          name: "on_change_forgot_password",
          type: "jobUserChangeForgotPassword",
          from: process.env.MAIL_USERNAME,
          recipients: [job.data.userEmail],
          data: {
            ...job.data,
            name: user.name,
            email: user.email,
            clientUrl,
            projectLabel: process.env.PROJECT_LABEL
              ? process.env.PROJECT_LABEL
              : process.env.PROJECT_NAME,
          },
          status: true,
          subject: "change password processing",
          templateId: "onChangeForgotPassword",
        };
        await app.service("mailQues").create(_mail);
      } catch (error) {
        console.error(error);
        throw Error(error);
      }
    } else {
      console.debug(`Job success but ${job.data} data not found`);
    }
  });

  worker.on("failed", async (job, err) => {
    console.debug(`Job ${job.id} failed with error ${err.message}`);
    if (job.data) {
      const _mail = {
        name: "on_change_forgot_password_failed",
        type: "jobUserChangeForgotPassword",
        from: process.env.MAIL_USERNAME,
        recipients: [job.data.userEmail, "info@cloudbasha.com"],
        data: {
          ...job.data,
          projectLabel: process.env.PROJECT_LABEL
            ? process.env.PROJECT_LABEL
            : process.env.PROJECT_NAME,
        },
        status: false,
        subject: "change password processing",
        templateId: "onChangeForgotPasswordFailed",
        errorMessage: err.message,
      };
      await app.service("mailQues").create(_mail);
    } else {
      console.debug(`Job error and ${job.data} data not found`);
    }
    if (err.message === "job stalled more than allowable limit") {
      await job.remove().catch((err) => {
        console.debug(
          `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`,
        );
      });
    }
  });


  const userChangePasswordService = app.service("userChangePassword");
  userChangePasswordService.hooks({
    after: {
      create: async (context) => {
        try {
          console.log("Create hook - context.result:", context.result);
          await jobQueue.add("jobUserChangeForgotPassword", {
            encrypted: context.result.encrypted || encryptData(context.result)
          });
        } catch (error) {
          console.error("Create hook error:", error);
        }
        return context;
      },
      patch: async (context) => {
        try {
          console.log("Patch hook - raw result:", context.result);
          const payload = {
            encrypted: context.result.encrypted || encryptData(context.result)
          };
          console.log("Original job data:", JSON.stringify(payload, null, 2));

          // Ensure we have the encrypted data
          if (!payload.encrypted) {
            throw new Error("No encrypted data found in job");
          }

          // Decrypt the data
          console.log("Decrypting data...");
          const decrypted = decryptData(payload.encrypted);
          console.log("Decrypted data:", JSON.stringify(decrypted, null, 2));

          await jobQueue.add("jobUserChangeForgotPassword", decrypted);

        } catch (error) {
          console.error("Patch hook error:", error);
        }
        return context;
      }
    }
  });
};



module.exports = { createChangeForgotPasswordQueWorker };