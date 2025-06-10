const { Queue, Worker } = require('bullmq');
const connection = require('../cbServices/redis/config');
const _ = require('lodash');
const config = require('../resources/config.json');
const standard = require('../resources/standard.json');
const axios = require('axios');
const { requestOptions } = require('../utils');

// Create and export the job queue
const jobQueue = new Queue('jobQueue', { connection });

// Create and export the worker
const createJobQueWorker = (app) => {
  const worker = new Worker(
    'jobQueue',
    async (job) => {
      const { id, data } = job;
      // console.debug(app.authorization);
      // Add your job processing logic
      console.debug(id, data);
      console.debug('service', data.fromService);
      const sourceData = await app.service(data.fromService).find({});
      // console.debug(sourceData.data.length);
      console.debug('service', data.toService);
      const destinationData = await app.service(data.toService).find({});
      // console.debug(destinationData.data.length);
      let destinationFields = _.find(config.services, {
        serviceName: data.toService,
      });
      if (!destinationFields) {
        destinationFields = _.find(standard.services, {
          serviceName: data.toService,
        });
      }
      // console.debug(destinationFields);
      const dynaFields = await app
        .service('dynaFields')
        .find({ query: { dynaLoader: data.dynaLoaderId } });
      // console.debug(data.dynaLoaderId);
      // console.debug(dynaFields.data);
      const referenceIds = _.filter(dynaFields.data, {
        toType: 'ObjectId',
      });
      // console.debug("referenceIds",referenceIds);
      const results = await Promise.all(
        referenceIds.map((ref) => app.service(ref.toRefService).find({})),
      );
      const referenceData = {};
      referenceIds.forEach(
        (ref, i) => (referenceData[ref.toRefService] = results[i].data),
      );

      const inserts = [];
      sourceData.data.forEach((row) => {
        const _data = {};
        destinationFields.schemaList.forEach((field) => {
          const dynaField = _.find(dynaFields.data, {
            to2: field.fieldName,
          });
          if (dynaField.from && row[dynaField.from]) {
            if (
              dynaField.toType === 'ObjectId' &&
              dynaField.identifierFieldName
            ) {
              const query = {};
              query[dynaField.identifierFieldName] = row[dynaField.from];
              const _value = _.find(
                referenceData[dynaField.toRefService],
                query,
              );
              if (_value) {
                _data[field.fieldName] = _value._id;
              } else {
                _data[field.fieldName] = null;
              }
            } else if (dynaField.toType === 'Date') {
              const dateParsed = Date.parse(row[dynaField.from]) || new Date();
              _data[field.fieldName] = new Date(dateParsed);
            } else {
              _data[field.fieldName] = row[dynaField.from] || null;
            }
          }
        });
        _data['createdBy'] = data.createdBy;
        _data['updatedBy'] = data.updatedBy;
        inserts.push(_data);
      });

      let patchination = [];
      destinationData.data.forEach((row) => {
        delete row.createdBy;
        delete row.updatedBy;
        delete row._id;
        delete row.createdAt;
        delete row.updatedAt;
        delete row.__v;

        // console.debug(row)
        const rowIndexData = _.findIndex(inserts, { ...row }, 0);
        // console.debug(rowIndexData)
        // if (rowIndexData >= 0) destination = inserts.splice(rowIndexData, 1);
        // else
        patchination.push(inserts[rowIndexData]);
      });
      // console.debug(inserts);
      // console.debug(destination.length);

      if (inserts.length > 0) {
        await app.service(data.toService).create(inserts);
      } else {
        console.debug('nothing to create');
      }
    },
    { connection },
  );

  // Event listeners for worker
  worker.on('completed', (job) => {
    console.debug(`JobQue ${job.id} completed successfully`);
    if (job.data) {
      try {
        app.service('jobQues').patch(job.data._id, {
          end: new Date(),
          status: true,
          jobId: job.id,
        });
        const _mail = {
          name: job.data.name.replaceAll(' ', '_').replace('=>', ''),
          type: 'dynaloader',
          from: 'info@cloudbasha.com',
          recipients: [job.data.email],
          status: true,
          data: {
            projectLabel: process.env.PROJECT_LABEL
              ? process.env.PROJECT_LABEL
              : process.env.PROJECT_NAME,
          },
          subject: 'job processing',
          templateId: 'onDynaLoader',
        };
        app.service('mailQues').create(_mail);
      } catch (error) {
        console.error(error);
        throw Error(error);
      }
    } else {
      console.debug(`Job success but ${job.data} data not found`);
    }
  });

  worker.on('failed', async (job, err) => {
    console.error(`JobQue ${job.id} failed with error ${err.message}`);
    if (job.data) {
      app.service('jobQues').patch(job.data._id, {
        end: new Date(),
        jobId: job.id,
      });
    } else {
      console.error(`Job error and ${job.data} data not found`);
    }
    if (err.message === 'job stalled more than allowable limit') {
      await job.remove().catch((err) => {
        console.error(
          `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`,
        );
      });
    }
  });

  const jobQueService = app.service('jobQues');
  jobQueService.hooks({
    after: {
      create: async (context) => {
        const { result } = context;
        await jobQueue.add('dynaLoader', result);
        return context;
      },
    },
  });
};

const createJobQueWorker2 = (app) => {
  let lengthOfData = 0;
  let duplicates = 0;
  let lengthOfSource = 0;
  let lengthOfSuccess = 0;
  let results;
  const worker = new Worker(
    'jobQueue',
    async (job) => {
      const { data } = job;
      // console.log("createJobQueWorker2", data);
      let sourceData;
      if (!data.isFile) {
        sourceData = await app.service(data.fromService).find({});
        lengthOfSource = sourceData.total;
      } else {
        const result = await app
          .service('fileUploadedImportStore')
          .find({ query: { _id: data.fileUploadedStorageId } });
        sourceData = result.data[0];
        lengthOfSource = result.data[0].data.length;
      }

      const destinationData = await app.service(data.toService).find({});
      // console.debug("destinationData",destinationData.data.length);

      let destinationFields;
      const res = await axios(requestOptions(`${data.toService}Schema`)).catch(
        (err) => console.error(err),
      );

      if (Array.isArray(res.data)) {
        destinationFields = res.data;
      }
      // console.debug(destinationFields);

      const dynaFields = await app
        .service('dynaFields')
        .find({ query: { dynaLoader: data.dynaLoaderId } });
      // console.debug(data.dynaLoaderId);
      // console.debug(dynaFields.data);

      const referenceIds = _.filter(dynaFields.data, {
        toType: 'ObjectId',
      });
      // console.debug("referenceIds",referenceIds);
      // return;
      const isFromKeyField = _.find(dynaFields.data, {
        to2: data.isKey,
      })['from'];
      console.debug('isFromKeyField', isFromKeyField);
      if (!isFromKeyField) {
        throw Error('iskey field is missing in field list.');
      }

      const results = await Promise.all(
        referenceIds.map((ref) => app.service(ref.toRefService).find({})),
      );
      const referenceData = {};
      referenceIds.forEach(
        (ref, i) => (referenceData[ref.toRefService] = results[i].data),
      );

      const inserts = [];
      sourceData.data
        // .filter((f, i) => i < 33)
        .forEach((row) => {
          const _data = {};
          destinationFields
            .filter(
              (f) =>
                ![
                  'createdBy',
                  'updatedBy',
                  '_id',
                  'updatedAt',
                  'createdAt',
                ].includes(f.field),
            )
            .forEach((field) => {
              const dynaField = _.find(dynaFields.data, {
                to2: field.field,
              });
              if (dynaField.from && row[dynaField.from]) {
                if (
                  dynaField.toType === 'ObjectId' &&
                  dynaField.identifierFieldName
                ) {
                  const query = {};
                  query[dynaField.identifierFieldName] = row[dynaField.from];
                  const _value = _.find(
                    referenceData[dynaField.toRefService],
                    query,
                  );
                  if (_value) {
                    _data[field.field] = _value._id;
                  } else {
                    _data[field.field] = null;
                  }
                } else if (dynaField.toType === 'Date') {
                  const dateParsed =
                    Date.parse(row[dynaField.from]) || new Date();
                  _data[field.field] = new Date(dateParsed);
                } else {
                  _data[field.field] = row[dynaField.from] || null;
                }
              }
            });
          _data['createdBy'] = data.createdBy;
          _data['updatedBy'] = data.updatedBy;
          inserts.push(_data);
        });

      // console.debug(inserts);
      let patchination = [];
      const patches = [];
      destinationData.data.forEach((row) => {
        delete row.createdBy;
        delete row.updatedBy;
        delete row._id;
        delete row.createdAt;
        delete row.updatedAt;
        delete row.__v;

        // console.debug(row);
        const query2 = {};
        query2[data.isKey] = String(row[isFromKeyField]);
        const rowIndexData = _.findIndex(inserts, query2, 0);
        if (rowIndexData >= 0) {
          const duplicate = inserts.splice(rowIndexData, 1);
          duplicates++;

          if (!_.isEmpty(data.toUpdate)) {
            console.log(data.toUpdate);
            patches.push(duplicate);
          }
        }
      });
      // console.debug(inserts);

      if (inserts.length > 0) {
        lengthOfData = inserts.length;
        if (data.type === 'insert' || data.type === 'upsert') {
          await app.service(data.toService).create(inserts);
        }
        if (data.type === 'update' || data.type === 'upsert') {
          await app.service(data.toService).patch(patches);
        }
        lengthOfSuccess = patchination.length;
      } else {
        console.debug('nothing to create');
      }

      if (patches.length > 0) {
        lengthOfData = patches.length;
        if (data.type === 'update' || data.type === 'upsert') {
          await app.service(data.toService).patch(patches);
        }
        lengthOfSuccess = patches.length;
      } else {
        console.debug('nothing to patch');
      }
    },
    { connection },
  );

  // Event listeners for worker
  worker.on('completed', (job) => {
    console.debug(`JobQue ${job.id} completed successfully`);
    if (job.data) {
      try {
        app.service('jobQues').patch(job.data._id, {
          end: new Date(),
          status: true,
          jobId: job.id,
        });
        const _mail = {
          name: job.data.name.replaceAll(' ', '_').replace('=>', ''),
          type: 'dynaloader',
          from: 'info@cloudbasha.com',
          recipients: [job.data.email],
          status: true,
          data: {
            projectLabel: process.env.PROJECT_LABEL
              ? process.env.PROJECT_LABEL
              : process.env.PROJECT_NAME,
            lengthOfData,
            duplicates,
            lengthOfSource,
            lengthOfSuccess,
            id: job.id,
            results,
          },
          subject: 'job processing',
          templateId: 'onDynaLoader',
        };
        app.service('mailQues').create(_mail);
      } catch (error) {
        console.error(error);
        throw Error(error);
      }
    } else {
      console.debug(`Job success but ${job.data} data not found`);
    }
  });

  worker.on('failed', async (job, err) => {
    console.error(`JobQue ${job.id} failed with error ${err.message}`);
    console.log(
      lengthOfData,
      duplicates,
      lengthOfSource,
      lengthOfSuccess,
      results,
    );
    if (job.data) {
      app.service('jobQues').patch(job.data._id, {
        end: new Date(),
        jobId: job.id,
      });
    } else {
      console.error(`Job error and ${job.data} data not found`);
    }
    if (err.message === 'job stalled more than allowable limit') {
      await job.remove().catch((err) => {
        console.error(
          `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`,
        );
      });
    }
  });

  const jobQueService = app.service('jobQues');
  jobQueService.hooks({
    after: {
      create: async (context) => {
        const { result } = context;
        await jobQueue.add('dynaLoader', result);
        return context;
      },
    },
  });
};

module.exports = { createJobQueWorker, createJobQueWorker2 };
