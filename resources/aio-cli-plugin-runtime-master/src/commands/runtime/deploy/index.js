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

let fs = require('fs')
let yaml = require('js-yaml')
const RuntimeBaseCommand = require('../../../RuntimeBaseCommand')
const { createKeyValueObjectFromFlag, createKeyValueObjectFromFile } = require('../../../runtime-helpers')
const { flags } = require('@oclif/command')
const debug = require('debug')('deploy')

class IndexCommand extends RuntimeBaseCommand {
  async run () {
    const { flags } = this.parse(IndexCommand)
    try {
      // in case of 'aio runtime:deploy' (without the path to the manifest file) the program looks for the manifest file in the current directory.
      let manifestPath
      if (!flags.manifest) {
        if (fs.existsSync('./manifest.yaml')) {
          manifestPath = 'manifest.yaml'
        } else if (fs.existsSync('./manifest.yml')) {
          manifestPath = 'manifest.yml'
        } else {
          throw (new Error('Manifest file not found'))
        }
      } else {
        manifestPath = flags.manifest
      }
      debug(`Using manifest file: ${manifestPath}`)

      let params = {}
      if (flags.param) {
        params = createKeyValueObjectFromFlag(flags.param)
      } else if (flags['param-file']) {
        params = createKeyValueObjectFromFile(flags['param-file'])
      }

      let manifest = yaml.safeLoad(fs.readFileSync(manifestPath, 'utf8'))
      let packages = manifest.packages
      let pkgtoCreate = []
      let actions = []
      let namePackage = ''
      Object.keys(packages).forEach((key) => {
        namePackage = key
        pkgtoCreate.push({ name: key })
        // From wskdeploy repo : currently, the 'version' and 'license' values are not stored in Apache OpenWhisk, but there are plans to support it in the future
        // pkg.version = packages[key]['version']
        // pkg.license = packages[key]['license']
        if (packages[key]['actions']) {
          Object.keys(packages[key]['actions']).forEach((actionName) => {
            let objAction = { name: `${key}/${actionName}` }
            let thisAction = packages[key]['actions'][actionName]
            if (thisAction['function'].endsWith('.zip')) {
              if (!thisAction['runtime']) {
                throw (new Error(`Invalid or missing runtime in the manifest for this action: ${objAction.name}`))
              }
              objAction.action = fs.readFileSync(thisAction['function'])
            } else {
              objAction.action = fs.readFileSync(thisAction['function'], { encoding: 'utf8' })
            }

            if (thisAction['runtime']) {
              // thisAction['runtime'] = thisAction['runtime'].replace('@', ':')  - Conflict in documentation
              objAction['kind'] = thisAction['runtime']
            }

            let limits = {}
            if (thisAction.limits) {
              if (thisAction.limits['memorySize']) {
                limits['memory'] = thisAction.limits['memorySize']
              }
              if (thisAction.limits['logSize']) {
                limits['logs'] = thisAction.limits['logSize']
              }
              if (thisAction.limits['timeout']) {
                limits['timeout'] = thisAction.limits['timeout']
              }
              objAction['limits'] = limits
            }

            objAction['annotations'] = returnAnnotations(thisAction)

            if (thisAction['inputs']) {
              // if parameter is provided as key : 'data type' , process it to set default values before deployment
              let processedInput = processInputs(thisAction['inputs'], params)
              objAction['params'] = processedInput
            }

            actions.push(objAction)
          })
        }

        if (packages[key]['apis']) {
          throw new Error('The "apis" key is not implemented for the deploy manifest.')
        }

        if (packages[key]['sequences']) {
          // Sequences can have only one field : actions
          // Usage: aio runtime:action:create <action-name> --sequence existingAction1, existingAction2
          Object.keys(packages[key]['sequences']).forEach((sequenceName) => {
            let actionArray = []
            if (packages[key]['sequences'][sequenceName]['actions']) {
              actionArray = (packages[key]['sequences'][sequenceName]['actions'].split(','))
            } else {
              throw new Error('Actions for the sequence not provided.')
            }
            let options = { name: `${key}/${sequenceName}`, action: '' }
            let objSequence = {}
            objSequence['kind'] = 'sequence'
            objSequence['components'] = actionArray
            options['exec'] = objSequence
            actions.push(options)
          })
        }
        if (packages[key]['rules']) {
          throw new Error('The "rules" key is not implemented for the deploy manifest.')
        }

        if (packages[key]['triggers']) {
          throw new Error('The "triggers" key is not implemented for the deploy manifest.')
        }
      })

      const ow = await this.wsk()

      let getPackage = await ow.packages.get(namePackage)
      let ns = getPackage.namespace
      for (let pkg of pkgtoCreate) {
        let options = {}
        options['name'] = pkg.name
        this.log(`Info: Deploying package [${pkg.name}]...`)
        await ow.packages.update(options)
        this.log(`Info: package [${pkg.name}] has been successfully deployed.\n`)
      }
      for (let action of actions) {
        // TODO : Need to improve the fetching of namespace and addition to actions
        if (action['exec']) {
          action['exec']['components'] = action['exec']['components'].map(sequence => {
            return `/${ns}/${sequence}`
          })
        }
        this.log(`Info: Deploying action [${action.name}]...`)
        await ow.actions.update(action)
        this.log(`Info: action [${action.name}] has been successfully deployed.\n`)
      }
      this.log('Success: Deployment completed successfully.')
    } catch (err) {
      this.handleError('Failed to deploy', err)
    }
  }
}

function returnAnnotations (action) {
  let annotationParams = {}
  if (action['web'] !== undefined) {
    annotationParams = checkWebFlags(action['web'])
  } else if (action['web-export'] !== undefined) {
    annotationParams = checkWebFlags(action['web-export'])
  } else {
    annotationParams['web-export'] = false
    annotationParams['raw-http'] = false
    return annotationParams
  }

  if (action['require-whisk-auth']) {
    if (annotationParams['web-export'] === true) {
      annotationParams['require-whisk-auth'] = action['require-whisk-auth']
    }
  }

  if (action['raw-http']) {
    if (annotationParams['web-export'] === true) {
      annotationParams['raw-http'] = action['raw-http']
    }
  }
  return annotationParams
}

function checkWebFlags (flag) {
  let tempObj = {}
  switch (flag) {
    case true:
    case 'yes' :
      tempObj['web-export'] = true
      break
    case 'raw' :
      tempObj['web-export'] = true
      tempObj['raw-http'] = true
      break
    case false:
    case 'no':
      tempObj['web-export'] = false
      tempObj['raw-http'] = false
  }
  return tempObj
}

function processInputs (input, params) {
  // check if the value of a key is an object (Advanced parameters)
  // TODO - Add other data types
  let dictDataTypes = {
    string: '',
    integer: 0,
    number: 0
  }

  // check if the value of a key is an object (Advanced parameters)
  for (let key in input) {
    if (params.hasOwnProperty(key)) {
      input[key] = params[key]
    } else {
      if (typeof input[key] === 'object') {
        for (let val in input[key]) {
          if (val === 'value') {
            input[key] = input[key][val]
          } else if (val === 'default') {
            input[key] = input[key][val]
          }
        }
      } else {
        // For example: name:'string' is changed to name:'' (Typed parameters)
        // For example: height:'integer' or height:'number' is changed to height:0 (Typed parameters)
        if (dictDataTypes.hasOwnProperty(input[key])) {
          input[key] = dictDataTypes[input[key]]
        } else if (input[key].startsWith('$')) {
          let val = input[key]
          val = val.substr(1)
          input[key] = process.env[val]
        }
      }
    }
  }

  return input
}

IndexCommand.flags = {
  ...RuntimeBaseCommand.flags,
  'manifest': flags.string({
    char: 'm',
    description: 'the manifest file location', // help description for flag
    hidden: false, // hide from help
    multiple: false, // allow setting this flag multiple times
    required: false
  }),
  'param': flags.string({
    description: 'parameter values in KEY VALUE format', // help description for flag
    hidden: false, // hide from help
    multiple: true, // allow setting this flag multiple times
    required: false
  }),
  'param-file': flags.string({
    char: 'P',
    description: 'FILE containing parameter values in JSON format', // help description for flag
    hidden: false, // hide from help
    multiple: false, // allow setting this flag multiple times
    required: false
  })
}

IndexCommand.description = 'The Runtime Deployment Tool'

module.exports = IndexCommand
