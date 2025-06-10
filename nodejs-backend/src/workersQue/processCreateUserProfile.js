const { Queue, Worker } = require("bullmq");
const connection = require("../services/redis/config");
const jobQueue = new Queue("createUserProfile", { connection });

const createUserProfileInDB = async (app, superAdmin, data) => {
  if (superAdmin === data.email) {
    // Super Admin: Single profile with "Super" role and "Admin" position
    const userAdminRole = await app
      .service("roles")
      .find({ query: { name: "Super" } });
    const userAdminPosition = await app
      .service("positions")
      .find({ query: { name: "Super" } });

    await app.service("profiles").create({
      name: `${data.name} - Admin`, 
      userId: data._id,
      role: userAdminRole.data[0]._id,
      position: userAdminPosition.data[0]._id,
    });
  } else {
    // Regular User: Fetch userInvites to get roles/positions
    const userInvite = await app.service("userInvites").find({
      query: { emailToInvite: data.email },
    });
    // console.log("User Invite Data:", userInvite.data);
    if (userInvite.data.length > 0) {
      const { roles = [], positions = [] } = userInvite.data[0];

      // If roles and positions are available, create profiles for each position
      if (positions.length > 0) {
        for (const positionId of positions) {
          // Get position details (including name)
          const position = await app.service("positions").get(positionId);

          // Get role ID (use corresponding role or default)
          let roleId = roles[positions.indexOf(positionId)]; 
          if (!roleId) {
            const defaultRole = await app
              .service("roles")
              .find({ query: { isDefault: true } });
            roleId = defaultRole.data[0]._id;
          }
          // console.log("Positions Array:", positions);
          // Create profile
          await app.service("profiles").create({
            name: `${data.name} - ${position.name}`, // username + position name
            userId: data._id,
            role: roleId,
            position: positionId,
          });
        }
      } else {
        // If no positions are available, create a profile with default role/position
        const defaultRole = await app
          .service("roles")
          .find({ query: { isDefault: true } });
        const defaultPosition = await app
          .service("positions")
          .find({ query: { isDefault: true } });

        await app.service("profiles").create({
          name: `${data.name} - ${defaultPosition.data[0].name}`, 
          userId: data._id,
          role: defaultRole.data[0]._id,
          position: defaultPosition.data[0]._id,
        });
      }
    } else {
      // No userInvites: Use default role/position
      const defaultRole = await app
        .service("roles")
        .find({ query: { isDefault: true } });
      const defaultPosition = await app
        .service("positions")
        .find({ query: { isDefault: true } });

      await app.service("profiles").create({
        name: `${data.name} - ${defaultPosition.data[0].name}`, 
        userId: data._id,
        role: defaultRole.data[0]._id,
        position: defaultPosition.data[0]._id,
      });
    }
  }
};


// Create and export the worker
const createUserProfile = (app) => {
  const superAdmin = "mehalamohan1999@gmail.com";
  const worker = new Worker(
    "createUserProfile",
    async (job) => {
      const { data } = job;
      if (Array.isArray(data)) {
        data.forEach(
          async (data) => await createUserProfileInDB(app, superAdmin, data),
        );
      } else await createUserProfileInDB(app, superAdmin, data);
    },
    { connection },
  );

  // Event listeners for worker
  worker.on("completed", (job) => {
    console.debug(`Job createUserProfile ${job.id} completed successfully`);
    if (job.data) {
      if (Array.isArray(job.data)) {
        job.data.forEach((data) => {
          const _mail = {
            name: "on_new_user_welcome_email",
            type: "firstimelogin",
            from: process.env.MAIL_USERNAME,
            recipients: [data.email],
            data: {
              name: data.name,
              projectLabel: process.env.PROJECT_LABEL
                ? process.env.PROJECT_LABEL
                : process.env.PROJECT_NAME,
            },
            status: true,
            subject: "First Time Login",
            templateId: "onWelcomeEmail",
          };
          app.service("mailQues").create(_mail);
        });
      } else {
        const _mail = {
          name: "on_new_user_welcome_email",
          type: "firstimelogin",
          from: process.env.MAIL_USERNAME,
          recipients: [job.data.email],
          data: {
            name: job.data.name,
            projectLabel: process.env.PROJECT_LABEL
              ? process.env.PROJECT_LABEL
              : process.env.PROJECT_NAME,
          },
          status: true,
          subject: "First Time Login",
          templateId: "onWelcomeEmail",
        };
        app.service("mailQues").create(_mail);
      }
    } else {
      console.debug(`Job error and ${job.data} data not found`);
    }
  });

  worker.on("failed", async (job, err) => {
    console.error(
      `Job createUserProfile ${job.id} failed with error ${err.message}`,
    );
    if (job.data) {
      if (Array.isArray(job.data)) {
        job.data.forEach((data) => {
          const _mail = {
            name: "on_send_welcome_email",
            type: "userInvitationOnCreateOnLoginQues",
            from: process.env.MAIL_USERNAME,
            recipients: [superAdmin],
            status: false,
            data: {
              ...data,
              projectLabel:
                process.env.PROJECT_LABEL ?? process.env.PROJECT_NAME,
            },
            subject: "login processing failed",
            templateId: "onError",
            errorMessage: err.message,
          };
          app.service("mailQues").create(_mail);
        });
      } else {
        const _mail = {
          name: "on_send_welcome_email",
          type: "userInvitationOnCreateOnLoginQues",
          from: process.env.MAIL_USERNAME,
          recipients: [superAdmin],
          status: false,
          data: {
            ...job.data,
            projectLabel: process.env.PROJECT_LABEL ?? process.env.PROJECT_NAME,
          },
          subject: "login processing failed",
          templateId: "onError",
          errorMessage: err.message,
          hook: job.data.hook ?? null,
        };
        app.service("mailQues").create(_mail);
      }
    } else {
      console.error(`Job error and ${job.data} data not found`);
    }
    if (err.message === "job stalled more than allowable limit") {
      await job.remove().catch((err) => {
        console.error(
          `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`,
        );
      });
    }
  });

  const userService = app.service("users");
  userService.hooks({
    after: {
      create: async (context) => {
        const { result } = context;
        if (typeof result.hook === "undefined")
          await jobQueue.add("createUserProfile", result);
        return context;
      },
    },
  });
};

module.exports = { createUserProfile };
