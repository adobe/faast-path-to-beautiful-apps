const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')

const packagejson = require(path.join(rootDir, 'package.json'))

// env variables
require('dotenv').config({ path: path.join(rootDir, '.env') })

// config
const config = {}
/// dotenv
config.owApihost = process.env.OW_APIHOST
config.owNamespace = process.env.OW_NAMESPACE
config.owAuth = process.env.OW_AUTH
config.owApiversion = process.env.OW_APIVERSION
config.tvmUrl = process.env.S3_TVM_URL
/// env
config.withRemoteActions = !!process.env.REMOTE_ACTIONS
/// package.json
config.version = packagejson.version || '0.0.1'
config.name = packagejson.name || 'unnamed-cna'
/// project paths
config.rootDir = rootDir
config.srcActionDir = path.join(config.rootDir, 'actions')
config.srcUIDir = path.join(config.rootDir, 'web-src')
config.srcWskdeployFile = path.join(config.rootDir, 'wskdeploy.yml')
config.distDir = path.join(config.rootDir, 'dist')
config.distActionsDir = path.join(config.distDir, 'actions')
config.distUIRemoteDir = path.join(config.distDir, 'ui-remote')
config.distUILocalDir = path.join(config.distDir, 'ui-local')
config.distWskdeployFile = path.join(config.rootDir, '.wskdeploy-dist.yml')
config.uiConfigFile = path.join(config.srcUIDir, 'src/config.json')
/// wskdeploy config
config.wskdeployPackagePlaceholder = '__CNA_PACKAGE__'
config.wskdeploy = yaml.safeLoad(fs.readFileSync(config.srcWskdeployFile, 'utf8'))
config.wskdeployPackage = config.wskdeploy.packages[config.wskdeployPackagePlaceholder]
config.wskdeployActions = config.wskdeployPackage.actions
/// deployment
config.s3BucketName = 'adobe-cna' // common to all // TODO get this one from TVM!!
config.owDeploymentPackage = `${config.name}-${config.version}`
config.s3DeploymentFolder = `${config.owNamespace}/${config.owDeploymentPackage}`
config.staticUrl = `https://s3.amazonaws.com/${config.s3BucketName}/${config.s3DeploymentFolder}`

// credentials
config.credsCacheFile = path.join(rootDir, '.aws.tmp.creds.json')

module.exports = config
