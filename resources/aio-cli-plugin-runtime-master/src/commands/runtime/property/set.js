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
const { PropertyKey, PropertyFlagsSet, propertiesFile } = require('../../../properties')

class PropertySet extends RuntimeBaseCommand {
  async run () {
    try {
      const { flags } = this.parse(PropertySet)
      const properties = propertiesFile()

      if (flags.auth) {
        properties.set(PropertyKey.AUTH, flags.auth)
      }

      if (flags.apihost) {
        properties.set(PropertyKey.APIHOST, flags.apihost)
      }

      if (flags.apiversion) {
        properties.set(PropertyKey.APIVERSION, flags.apiversion)
      }

      if (flags.namespace) {
        properties.set(PropertyKey.NAMESPACE, flags.namespace)
      }

      properties.save()
    } catch (err) {
      this.handleError('failed to set the property', err)
    }
  }
}

PropertySet.flags = {
  ...PropertyFlagsSet,
  ...RuntimeBaseCommand.baseFlags
}

PropertySet.description = 'set property'

module.exports = PropertySet
