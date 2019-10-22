#!/usr/bin/env node

function execute(command) {
  const exec = require('child_process').exec
  
    exec(command, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      return(stdout)
    })
  }
  
async function sh(cmd) {
  const exec = require('child_process').exec
  
    return new Promise(function (resolve, reject) {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }

module.exports = {
    execute,
    sh
}