#!/usr/bin/env node

function execute(command) {
    const exec = require('child_process').exec
  
    exec(command, (err, stdout, stderr) => {
      return(stdout)
    })
  }
  
module.exports = {
    execute
}