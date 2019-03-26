const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const config = require('./script.config')

// sync
function installDep () {
  Object.entries(config.wskdeployActions).forEach(([name, action]) => {
    const actionPath = path.join(config.rootDir, action.function)
    if (fs.statSync(actionPath).isDirectory() &&
        fs.readdirSync(actionPath).includes('package.json')) {
      // npm install
      const install = childProcess.spawnSync(`npm`, ['install', '--no-package-lock'], { cwd: actionPath })
      if (install.error) throw install.error
      if (install.status !== 0) throw new Error(install.stderr.toString())
    }
  })
}

installDep()
