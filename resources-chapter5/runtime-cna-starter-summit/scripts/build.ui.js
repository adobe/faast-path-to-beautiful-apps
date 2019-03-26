const Bundler = require('parcel-bundler')
const fs = require('fs-extra')
const path = require('path')

const config = require('./script.config')

async function buildUI () {
  // clean/create needed dirs
  fs.emptyDirSync(config.distUIRemoteDir)

  // 1. generate config
  require('./generate.config')

  // 2. build UI files
  const bundler = new Bundler(path.join(config.srcUIDir, 'index.html'), {
    cache: false,
    outDir: config.distUIRemoteDir,
    publicUrl: config.staticUrl,
    watch: false,
    detailedReport: true
  })

  await bundler.bundle()
  console.log('UI Build succeeded!')
}

buildUI().catch(e => console.error(e))
