const fs = require("fs");
const fileFolder = "./src/resources";
const codeGen = require("./utils/codegen");
const _ = require("lodash");
const mongoose = require("mongoose");

// Your setup function
module.exports = (app) => {
    initializeSuperUser(app);
    insertRefData(app);
    console.debug("Setup completed.");
};

// async function moveFile(file) {
//     const source = `${fileFolder}/${file}`;
//     const destination = `${fileUploded}/${file}`;

//     try {
//         await fsp.rename(source, destination);
//         console.debug(`File moved from ${source} to ${destination}`);
//     } catch (error) {
//         console.error(`Error moving file: ${error.message}`);
//     }
// }

const initializeSuperUser = (app) => {
    const userEmail = ["menakamohan1999@gmail.com"];
    app.service("userInvites")
        .find({
            query: {
                emailToInvite: { $in: userEmail }
            }
        })
        .then(async (getUserEmail) => {
            if (getUserEmail.data.length === 0) {
                await app.service("userInvites").create(
                    userEmail.map((user) => {
                        return {
                            emailToInvite: user,
                            status: false,
                            sendMailCounter: 0,
                            code: codeGen()
                        };
                    })
                );
            }
        });
};

const insertRefData = (app) => {
    let files = fs.readdirSync(fileFolder);
    files = files.filter(
        (file) => !["config.json", "standard.json"].includes(file)
    );

    const sortOrder = ["templates", "roles", "positions", "users", "profiles"];
    files = files.sort((a, b) => a.localeCompare(b));
    files = _.sortBy(files, function (file) {
        return _.indexOf(sortOrder, file.split(".")[1]);
    });

    const promises = [];
    const services = [];
    const results = [];

    files.forEach((file) => {
        const names = file.split(".");
        const service = _.camelCase(names[1]);
        if (service) {
            const existing = app.service(service).find({});
            promises.push(existing);
            services.push(service);
        } else console.debug("file empty", names[1]);
    });

    if (_.isEmpty(services)) return;

    Promise.all(promises).then(async (allData) => {
        try {
            services.forEach(async (service, i) => {
                try {
                    const _results = insertData(
                        app,
                        allData[i].data,
                        files[i],
                        service
                    );
                    if (!_.isEmpty(_results)) results.push(_results);
                    // moveFile(files[i]);
                } catch (error) {
                    console.error(error);
                }
            });

            if (!_.isEmpty(results)) {
                await Promise.all(results);
            }
        } catch (error) {
            console.error(error.message);
        }
    });
};

const insertData = (app, existing, file, service) => {
    const dataNew = require(`./resources/${file}`);
    const inserts = [];
    if (dataNew.length === 0) return [];

    dataNew.forEach((n) => {
        for (const [key, value] of Object.entries(n)) {
            if (typeof value === "object") {
                for (const [key1, value1] of Object.entries(value)) {
                    if (key1 === "$oid")
                        n[key] = new mongoose.Types.ObjectId(value1);
                    if (key1 === "$date") n[key] = value1;
                }
            }
        }
        const temp = n;
        delete temp.__v;
        delete temp.createdAt;
        delete temp.updatedAt;
        if (!_.find(existing, temp)) {
            temp["hook"] = false;
            if (
                typeof n._id != "undefined" &&
                !_.find(existing, { _id: new mongoose.Types.ObjectId(n._id) })
            )
                inserts.push(temp);
            else if (typeof n._id === "undefined") inserts.push(temp);
        }
    });

    if (!_.isEmpty(inserts)) {
        return [app.service(service).create(inserts)];
    } else return [];
};
