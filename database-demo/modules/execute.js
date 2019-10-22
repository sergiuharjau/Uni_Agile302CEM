#!/usr/bin/env node

function execute(command) {
  const exec = require('child_process').exec
  
    await exec(command, (err, stdout, stderr) => {
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

let output = sh("python3 /home/pi/Documents/AgilePlaceholder/capturing_test.py")

console.log(output)

module.exports = {
    execute,
    sh
}