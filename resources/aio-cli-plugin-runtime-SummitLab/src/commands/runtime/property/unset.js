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
const { PropertyKey, PropertyFlagsGet: PropertyFlagsUnset, propertiesFile } = require('../../../properties')

class PropertyUnset extends RuntimeBaseCommand {
  async run () {
    try {
      const { flags } = this.parse(PropertyUnset)
      const properties = propertiesFile()

      properties.unset = function (key) {
        delete this._properties[key]
      }

      if (flags.auth) {
        properties.unset(PropertyKey.AUTH)
      }

      if (flags.apihost) {
        properties.unset(PropertyKey.APIHOST)
      }

      if (flags.apiversion) {
        properties.unset(PropertyKey.APIVERSION)
      }

      if (flags.namespace) {
        properties.unset(PropertyKey.NAMESPACE)
      }

      properties.save()
    } catch (err) {
      this.handleError('failed to unset the property', err)
    }
  }
}

PropertyUnset.flags = {
  ...PropertyFlagsUnset,
  ...RuntimeBaseCommand.baseFlags
}

PropertyUnset.description = 'unset property'

module.exports = PropertyUnset
