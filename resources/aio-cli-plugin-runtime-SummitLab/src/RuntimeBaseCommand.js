const { Command, flags } = require('@oclif/command')

const debug = require('debug')
const { propertiesFile } = require('./properties')

class RuntimeBaseCommand extends Command {
  async wsk () {
    const { flags } = this.parse(this.constructor)

    const properties = propertiesFile()

    const OpenWhisk = require('openwhisk')

    const ow = OpenWhisk({
      apihost: flags.apihost || properties.get('APIHOST'),
      namespace: properties.get('NAMESPACE'),
      api_key: flags.auth || properties.get('AUTH'),
      ignore_certs: flags.insecure
    })

    return ow
  }

  async init () {
    const { flags } = this.parse(this.constructor)

    // See https://www.npmjs.com/package/debug for usage in commands
    if (flags.verbose) {
      // verbose just sets the debug filter to everything (*)
      debug.enable('*')
    } else if (flags.debug) {
      debug.enable(flags.debug)
    }
  }

  handleError (msg, err) {
    const { flags } = this.parse(this.constructor)

    msg = msg || 'unknown error'
    if (err) {
      msg = `${msg}: ${err.message}`

      if (flags.verbose) {
        debug.log(err) // for stacktrace when verbose
      }
    }
    return this.error(msg)
  }

  logJSON (msg, obj) {
    if (msg) {
      this.log(msg, JSON.stringify(obj, null, 2))
    } else {
      this.log(JSON.stringify(obj, null, 2))
    }
  }
}

RuntimeBaseCommand.extraFlags = {
  apihost: flags.string({ description: 'whisk API HOST' }),
  auth: flags.string({ char: 'u', description: 'authorization KEY' }),
  insecure: flags.boolean({ char: 'i', description: 'bypass certificate check' })
}

RuntimeBaseCommand.baseFlags = {
  debug: flags.string({ char: 'd', description: 'Debug level output' }),
  verbose: flags.boolean({ char: 'v', description: 'Verbose output' }),
  version: flags.boolean({ description: 'Show version' }),
  help: flags.boolean({ description: 'Show help' })
}

RuntimeBaseCommand.flags = {
  ...RuntimeBaseCommand.extraFlags,
  ...RuntimeBaseCommand.baseFlags
}

module.exports = RuntimeBaseCommand
