/**
 * Proxy server for client dev
 */
const Bundler = require('parcel-bundler')
const express = require('express')
const ActionRunner = require('./runner')

const config = require('./script.config')

/**
 * Generate Config
 */
require('./generate.config')

/**
 * Make sure zip actions have their dependencies installed
 */
require('./install.zip.actions.dep')

const bundler = new Bundler('web-src/index.html', {
  cache: false,
  outDir: config.distUILocalDir,
  contentHash: false
})

const app = express()

app.use(express.json())

/**
 * Actions as API
 */
app.all(
  '/actions/*',
  ActionRunner
)

app.use(bundler.middleware())
const port = Number(process.env.PORT || 9000)
app.listen(port)

console.log('Serving on port', port)
