const fs = require('fs')
const path = require('path')
const PropertiesReader = require('properties-reader')
const { flags } = require('@oclif/command')
const debug = require('debug')('property')

const PropertyKey = {
  AUTH: 'AUTH',
  APIHOST: 'APIHOST',
  APIVERSION: 'APIVERSION',
  NAMESPACE: 'NAMESPACE'
}

const PropertyEnv = {
  AUTH: 'WHISK_AUTH',
  APIHOST: 'WHISK_APIHOST',
  APIVERSION: 'WHISK_APIVERSION',
  NAMESPACE: 'WHISK_NAMESPACE',
  CONFIG_FILE: 'WSK_CONFIG_FILE'
}

const PropertyDefault = {
  AUTH: '',
  APIHOST: '',
  APIVERSION: 'v1',
  NAMESPACE: '_',
  CONFIG_FILE: path.join(require('os').homedir(), '.wskprops')
}

const PropertyFlagsGet = {
  auth: flags.boolean({ description: 'whisk auth' }),
  apihost: flags.boolean({ description: 'whisk API host' }),
  namespace: flags.boolean({ description: 'whisk namespace' }),
  apiversion: flags.boolean({ description: 'whisk API version' })
}

const PropertyFlagsSet = {
  auth: flags.string({ description: 'whisk auth' }),
  apihost: flags.string({ description: 'whisk API host' }),
  namespace: flags.string({ description: 'whisk namespace' }),
  apiversion: flags.string({ description: 'whisk API version' })
}

function propertiesFile ({ loadEnv = true } = {}) {
  let wskConfigFile = process.env[PropertyEnv.CONFIG_FILE] || PropertyDefault.CONFIG_FILE
  if (!fs.existsSync(wskConfigFile)) {
    throw new Error(`OpenWhisk config file '${wskConfigFile}' does not exist.`)
  }
  const properties = PropertiesReader(wskConfigFile)
  properties.save = function () {
    let saved = []
    this.each((key, val) => saved.push(`${key}=${val}`))

    fs.writeFileSync(wskConfigFile, saved.join('\n'))
  }

  if (loadEnv) {
  // environment variable overrides
    let envVar = process.env[PropertyEnv.AUTH]
    if (envVar) {
      debug(`Env var ${PropertyEnv.AUTH} found, overriding value in config file.`)
      properties.set(PropertyKey.AUTH, envVar)
    }

    envVar = process.env[PropertyEnv.APIHOST]
    if (envVar) {
      debug(`Env var ${PropertyEnv.APIHOST} found, overriding value in config file.`)
      properties.set(PropertyKey.APIHOST, envVar)
    }

    envVar = process.env[PropertyEnv.NAMESPACE]
    if (envVar) {
      debug(`Env var ${PropertyEnv.NAMESPACE} found, overriding value in config file.`)
      properties.set(PropertyKey.NAMESPACE, envVar)
    }

    envVar = process.env[PropertyEnv.APIVERSION]
    if (envVar) {
      debug(`Env var ${PropertyEnv.APIVERSION} found, overriding value in config file.`)
      properties.set(PropertyKey.APIVERSION, envVar)
    }
  }

  return properties
}

module.exports = {
  propertiesFile,
  PropertyKey,
  PropertyEnv,
  PropertyDefault,
  PropertyFlagsGet,
  PropertyFlagsSet
}
