/*
Copyright Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const RuntimeBaseCommand = require('../../../RuntimeBaseCommand')
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')
const rp = require('request-promise-native')
const { PropertyKey, PropertyFlagsGet, PropertyDefault, propertiesFile } = require('../../../properties')
const debug = require('debug')('property')

class PropertyGet extends RuntimeBaseCommand {
  async run () {
    try {
      const { flags } = this.parse(PropertyGet)

      // if no property flags specified, default to all
      if (!(flags.all || flags.apiversion ||
      flags.auth || flags.cliversion || flags.namespace ||
      flags.apibuild || flags.apihost || flags.apibuildno
      )) {
        flags.all = true
      }

      let data = []
      const properties = propertiesFile()

      // get property data

      if (flags.all || flags.auth) {
        data.push({ Property: PropertyGet.flags.auth.description, Value: properties.get(PropertyKey.AUTH) || PropertyDefault.AUTH })
      }

      const apiHost = properties.get(PropertyKey.APIHOST) || PropertyDefault.APIHOST
      if (flags.all || flags.apihost) {
        data.push({ Property: PropertyGet.flags.apihost.description, Value: apiHost })
      }

      const apiVersion = properties.get(PropertyKey.APIVERSION) || PropertyDefault.APIVERSION
      if (flags.all || flags.apiversion) {
        data.push({ Property: PropertyGet.flags.apiversion.description, Value: apiVersion })
      }

      if (flags.all || flags.namespace) {
        data.push({ Property: PropertyGet.flags.namespace.description, Value: properties.get(PropertyKey.NAMESPACE) || PropertyDefault.NAMESPACE })
      }

      if (flags.all || flags.cliversion) {
        data.push({ Property: PropertyGet.flags.cliversion.description, Value: this.config.userAgent })
      }

      // to get apibuild and apibuildno, we need to do a server call
      if (flags.all || flags.apibuild || flags.apibuildno) {
        const options = {
          uri: `${apiHost}/api/${apiVersion}`,
          method: 'GET',
          json: true
        }

        let result = { build: 'error', buildno: 'error' }
        try {
          debug(`Getting data from url ${options.uri} ...\n`)
          result = await rp(options)
          debug(JSON.stringify(result, null, 2))
        } catch (err) {
          debug(err)
        }

        if (flags.all || flags.apibuild) {
          data.push({ Property: PropertyGet.flags.apibuild.description, Value: result.build })
        }

        if (flags.all || flags.apibuildno) {
          data.push({ Property: PropertyGet.flags.apibuildno.description, Value: result.buildno })
        }
      }

      cli.table(data,
        {
          Property: { minWidth: 10 },
          Value: { minWidth: 20 }
        },
        {
          printLine: this.log,
          'no-truncate': true,
          ...flags // parsed flags
        })
    } catch (err) {
      this.handleError('failed to get the property', err)
    }
  }
}

PropertyGet.flags = {
  ...PropertyFlagsGet,
  ...RuntimeBaseCommand.baseFlags,
  all: flags.boolean({
    description: 'all properties'
  }),
  apibuild: flags.boolean({
    description: 'whisk API build version'
  }),
  apibuildno: flags.boolean({
    description: 'whisk API build number'
  }),
  cliversion: flags.boolean({
    description: 'whisk CLI version'
  })
}

PropertyGet.description = 'get property'

module.exports = PropertyGet
