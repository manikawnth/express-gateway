const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const uuid = require('node-uuid');

const modulePath = path.resolve(__dirname, '..', '..', 'bin', 'index.js');

module.exports.bootstrapFolder = function (options) {
  let tempDir = path.join(os.tmpdir(), uuid.v4());
  fs.mkdirSync(tempDir);
  let execOptions = {
    env: Object.assign({}, process.env)
  };
  let cmd = modulePath + '  gateway create -t getting-started -n test -d ' + tempDir;
  return new Promise((resolve, reject) => {
    exec(cmd, execOptions, function (error, stdout, stderr) {
      if (error !== null) {
        reject(error);
      }
      resolve({
        basePath: tempDir,
        configDirectoryPath: path.join(tempDir, 'config'),
        gatewayConfigPath: path.join(tempDir, 'config', 'gateway.config.yml'),
        systemConfigPath: path.join(tempDir, 'config', 'system.config.yml')
      });
    });
  });
};

module.exports.runCLICommand = function ({adminPort, adminUrl, configDirectoryPath, cliArgs}) {
  // TODO: it should not depend on configFolder, API only, now the last dependency is models
  let cliExecOptions = Object.assign({}, {
    env: process.env
  });
  cliExecOptions.env.EG_CONFIG_DIR = configDirectoryPath;
  cliExecOptions.env.EG_ADMIN_URL = adminUrl || `http://localhost:${adminPort}`;
  const command = [modulePath].concat(cliArgs).join(' ');
  console.log(command);
  return new Promise((resolve, reject) => {
    exec(command, cliExecOptions, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const obj = JSON.parse(stdout);
        resolve(obj);
      } catch (err) {
        if (err instanceof SyntaxError) {
          resolve(stdout);
        } else {
          reject(err);
        }
      }
    });
  });
};
