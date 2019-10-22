#!/usr/bin/env node
const run = require('child_process').exec
  
async function sh(cmd) {
  
    return new Promise(function (resolve, reject) {
      run(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }

module.exports = {
    sh
}