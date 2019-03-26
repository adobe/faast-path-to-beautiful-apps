const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const aws = require('aws-sdk')
const utils = require('./script.utils')

const config = require('./script.config')

async function initialChecks () {
  if (!fs.statSync(config.distUIRemoteDir).isDirectory() || !fs.readdirSync(config.distUIRemoteDir).length) {
    throw new Error(config.distUIRemoteDir + ' should not be empty, maybe you forgot to build your UI ?')
  }

  if (!fs.statSync(config.distActionsDir).isDirectory() || !fs.readdirSync(config.distActionsDir).length) {
    throw new Error(config.distActionsDir + ' should not be empty, maybe you forgot to build your actions ?')
  }
}

async function deployStaticS3 () {
  console.log(`Uploading static web files to ${config.staticUrl}...`)

  const creds = await utils.getS3Credentials(config.tvmUrl, config.owNamespace, config.owAuth, config.credsCacheFile)

  const s3 = new aws.S3(creds)

  if (await utils.s3.folderExists(s3, config.s3BucketName, config.s3DeploymentFolder)) {
    console.warn(`Warning: An already existing deployment for version ${config.version} will be overwritten`)
    await utils.s3.emptyFolder(s3, config.s3BucketName, config.s3DeploymentFolder)
  }
  return utils.s3.uploadDir(s3, config.s3BucketName, config.s3DeploymentFolder,
    config.distUIRemoteDir, f => console.log(`  -> ${path.basename(f)}`))
}

function deployActions () {
  console.log(`Deploying actions to ${config.owApihost}...`)

  // rewrite wskdeploy config
  const wskdeployCopy = { ...config.wskdeploy }
  const wskdeployPackage = wskdeployCopy.packages[config.wskdeployPackagePlaceholder]

  wskdeployPackage.version = config.version

  Object.entries(wskdeployPackage.actions).forEach(([name, action]) => {
    // if it is a dir then let wskdeploy do the zip, otherwise change path for parcel build
    if (!fs.statSync(path.join(config.rootDir, action.function)).isDirectory()) {
      action.function = path.join(path.relative(config.rootDir, config.distActionsDir), name + '.js')
      // this is needed because of https://github.com/apache/incubator-openwhisk-runtime-nodejs/issues/14
      action.main = 'module.exports.' + (action.main || 'main')
    }
  })

  // replace package name
  const wskdeployString = yaml.safeDump(wskdeployCopy).replace(config.wskdeployPackagePlaceholder, config.owDeploymentPackage)

  // write the new wskdeploy yaml
  fs.writeFileSync(config.distWskdeployFile, wskdeployString)

  // invoke wskdeploy command
  const wskdeploy = childProcess.spawnSync(
    `./wskdeploy`,
    [
      '--apihost', config.owApihost,
      '--auth', config.owAuth,
      '--namespace', config.owNamespace,
      '-p', '.', '-m', config.distWskdeployFile
    ],
    { cwd: config.rootDir }
  )
  if (wskdeploy.error) throw wskdeploy.error
  if (wskdeploy.status !== 0) throw new Error(wskdeploy.stderr.toString())

  // show list of deployed actions
  Object.keys(config.wskdeployActions).forEach(an => {
    console.log('  -> ' + an)
  })
}

async function finalMessage () {
  console.log('Deployment succeeded 🎉')
  console.log(`Access your app @ ${config.staticUrl}/index.html !`)
}

initialChecks()
  .then(deployStaticS3)
  .then(deployActions)
  .then(finalMessage)
  .catch(e => console.error(e))
