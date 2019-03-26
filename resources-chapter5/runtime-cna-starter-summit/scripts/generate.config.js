const fs = require('fs')

const config = require('./script.config')

/**
 * Generate Config Service Urls
 */
function generateConfig () {
  const urlMappings = Object.entries(config.wskdeployActions).reduce((obj, [name, action]) => {
    const webArg = action['web-export'] || action['web']
    const webUri = (webArg && webArg !== 'no' && webArg !== 'false') ? 'web/' : ''

    obj[name] = (config.withRemoteActions
      ? `${config.owApihost}/api/${config.owApiversion}/${webUri}${config.owNamespace}/${config.owDeploymentPackage}/${name}`
      : `/actions/${name}`)
    return obj
  }, {})

  fs.writeFileSync(
    config.uiConfigFile,
    JSON.stringify(urlMappings), { encoding: 'utf-8' }
  )
}

generateConfig()
