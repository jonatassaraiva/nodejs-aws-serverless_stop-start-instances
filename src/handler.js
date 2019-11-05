'use strict';
const AWS = require('aws-sdk');

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const _strat = (params) => {
  return new Promise((resolve, reject) => {
    ec2.startInstances(params, (err, data) => {
      if (err && err.code === 'DryRunOperation') {
        params.DryRun = false;
        ec2.startInstances(params, function (err, data) {
          if (err) {
            return reject(err);
          } else if (data) {
            return resolve('Success', data.StoppingInstances);
          }
        });
      } else {
        return reject(new Error('You don\'t have permission to start this instances'));
      }
    });
  });
}

const _stop = (params) => {
  return new Promise((resolve, reject) => {
    ec2.stopInstances(params, (err, data) => {
      if (err && err.code === 'DryRunOperation') {
        params.DryRun = false;
        ec2.stopInstances(params, function (err, data) {
          if (err) {
            return reject(err);
          } else if (data) {
            return resolve('Success', data.StoppingInstances);
          }
        });
      } else {
        return reject(new Error('You don\'t have permission to stop this instance'));
      }
    });
  });
}

module.exports.startOrStop = async (event) => {
  let execute;
  if(event.start) {
    console.info('Start Instaces:');
    execute = _strat;
  } else {
    console.info('Stop Instaces:');
    execute = _stop;
  }

  const response = [];
  const instancesIds = process.env.INSTANCE_IDS.split(',')
  for (const id of instancesIds) {
    const params = {
      InstanceIds: [id.trim()],
      DryRun: true
    };
    try {
      const result = await execute(params);
      response.push({id: params.InstanceIds[0], result});
      console.info(params.InstanceIds[0]);
    } catch (error) {
      console.error(params.InstanceIds[0], error.message);
      continue;
    }
  }

  return response;
};