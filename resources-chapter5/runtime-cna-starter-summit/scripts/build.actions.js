const fs = require('fs')
const path = require('path')
const Bundler = require('parcel-bundler')

const config = require('./script.config')

async function buildActions () {
  // installs dependencies in zip actions,
  // wskdeploy will take care to create the zip
  require('./install.zip.actions.dep') // sync

  const build = async function (name, action) {
    const actionPath = path.join(config.rootDir, action.function)
    // if not directory => package and minify to single file
    if (!fs.statSync(actionPath).isDirectory()) {
      const bundler = new Bundler(actionPath, {
        outDir: config.distActionsDir,
        outFile: name + '.js',
        cache: false,
        watch: false,
        target: 'node',
        contentHash: false,
        minify: true,
        sourceMaps: false,
        bundleNodeModules: true,
        logLevel: 4
      })
      // promise
      return bundler.bundle()
    }
  }

  // build all sequentially
  for (let [name, action] of Object.entries(config.wskdeployActions)) {
    await build(name, action)
  }
  console.log()
  console.log('Action Build succeeded!')
}

buildActions().catch(e => console.error(e))
