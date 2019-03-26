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
const { createKeyValueObjectFromFlag, createKeyValueObjectFromFile, returnIntersection } = require('../../../runtime-helpers')
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

      let deploymentPackages = {}
      if (flags.deployment) {
        let deployment = yaml.safeLoad(fs.readFileSync(flags.deployment, 'utf8'))
        deploymentPackages = deployment.project.packages
      }
      let manifest = yaml.safeLoad(fs.readFileSync(manifestPath, 'utf8'))
      let packages = manifest.packages
      let commonPackages
      if (Object.entries(deploymentPackages).length !== 0) {
        commonPackages = returnIntersection(packages, deploymentPackages)
      }
      let pkgtoCreate = []
      let actions = []
      let rules = []
      let triggers = []
      let ruleAction = []
      let ruleTrigger = []
      Object.keys(packages).forEach((key) => {
        pkgtoCreate.push({ name: key })
        // From wskdeploy repo : currently, the 'version' and 'license' values are not stored in Apache OpenWhisk, but there are plans to support it in the future
        // pkg.version = packages[key]['version']
        // pkg.license = packages[key]['license']
        if (packages[key]['actions']) {
          Object.keys(packages[key]['actions']).forEach((actionName) => {
            let thisAction = packages[key]['actions'][actionName]
            let objAction = { name: `${key}/${actionName}` }
            objAction = createActionObject(thisAction, params, objAction)
            ruleAction.push(actionName)
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
            let options = { name: `${key}/${sequenceName}`, action: '' }
            let thisSequence = packages[key]['sequences'][sequenceName]['actions']
            options = createSequenceObject(thisSequence, options, key)
            ruleAction.push(sequenceName)
            actions.push(options)
          })
        }
        if (packages[key]['triggers']) {
          Object.keys(packages[key]['triggers']).forEach((triggerName) => {
            let objTrigger = { name: triggerName, trigger: {} }
            if (flags.deployment) {
              objTrigger = createTriggerObject(commonPackages, key, packages, deploymentPackages, params, objTrigger)
            } else {
              if (packages[key]['triggers'][triggerName]['inputs'] !== null) {
                objTrigger = returnObjTrigger(packages[key]['triggers'][triggerName]['inputs'], objTrigger, params)
              }
            }
            // trigger creation requires only name parameter and hence will be created in all cases
            triggers.push(objTrigger)
            ruleTrigger.push(triggerName)
          })
        }
        // Rules cannot belong to any package
        if (packages[key]['rules']) {
          Object.keys(packages[key]['rules']).forEach((ruleName) => {
            let objRule = { name: ruleName }
            if (packages[key]['rules'][ruleName]['trigger'] && packages[key]['rules'][ruleName]['action']) {
              objRule['trigger'] = packages[key]['rules'][ruleName]['trigger']
              objRule['action'] = packages[key]['rules'][ruleName]['action']
            } else {
              throw new Error('Trigger and Action are both required for rule creation')
            }
            if (ruleAction.includes(objRule['action']) && ruleTrigger.includes(objRule['trigger'])) {
              objRule['action'] = `${key}/${objRule['action']}`
              rules.push(objRule)
            } else {
              throw new Error('Action/Trigger provided in the rule not found in manifest file')
            }
          })
        }
      })

      const ow = await this.wsk()
      let opts = await ow.actions.client.options
      let ns = opts.namespace
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
      for (let trigger of triggers) {
        this.log(`Info: Deploying trigger [${trigger.name}]...`)
        await ow.triggers.update(trigger)
        this.log(`Info: trigger [${trigger.name}] has been successfully deployed.\n`)
      }
      for (let rule of rules) {
        this.log(`Info: Deploying rule [${rule.name}]...`)
        rule.action = `/${ns}/${rule.action}`
        await ow.rules.update(rule)
        this.log(`Info: rule [${rule.name}] has been successfully deployed.\n`)
      }
      this.log('Success: Deployment completed successfully.')
    } catch (err) {
      this.handleError('Failed to deploy', err)
    }
  }
}

function returnObjTrigger (triggerInput, objTrigger, params) {
  if (triggerInput !== null) {
    let processedInput = processInputs(triggerInput, params)
    processedInput = createKeyValueInput(processedInput)
    objTrigger['trigger']['parameters'] = processedInput
    return objTrigger
  } else {
    return objTrigger
  }
}

function createKeyValueInput (input) {
  input = Object.keys(input).map(function (k) {
    return { key: k, value: input[k] }
  })
  return input
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

function createSequenceObject (thisSequence, options, key) {
  let actionArray = []
  if (thisSequence) {
    actionArray = thisSequence.split(',')
    actionArray = actionArray.map((action) => {
      // remove space between two actions after split
      let actionItem = action.replace(/\s+/g, '')
      return `${key}/${actionItem}`
    })
  } else {
    throw new Error('Actions for the sequence not provided.')
  }
  let objSequence = {}
  objSequence['kind'] = 'sequence'
  objSequence['components'] = actionArray
  options['exec'] = objSequence
  return options
}

function createTriggerObject (commonPackages, key, packages, deploymentPackages, params, objTrigger) {
  // Check if the manifest file and deployment file have a common package
  if (commonPackages.length !== 0) {
    // check whether the package with name 'key' is the common package
    if (commonPackages.includes(key)) {
      // check if the common package between the manifest and deployment files has any common triggers
      let commonTriggers = returnIntersection(packages[key]['triggers'], deploymentPackages[key]['triggers'])
      if (commonTriggers.length !== 0 && commonTriggers !== undefined) {
        // check if this particular trigger is that common trigger
        if (commonTriggers.includes(objTrigger.name)) {
          if (deploymentPackages[key]['triggers'][objTrigger.name]['inputs']) {
            objTrigger['trigger']['parameters'] = createKeyValueInput(deploymentPackages[key]['triggers'][objTrigger.name]['inputs'])
          } else {
            throw new Error('Inputs not present in Trigger')
          }
        }
      } else {
        // throws error if no common triggers for same package name in manifest and deployment files
        throw new Error('Trigger name in deployment file not present in manifest file')
      }
    } else {
      // creates a trigger object for a package that is present in the manifest file but not in the deployment file
      objTrigger = returnObjTrigger(packages[key]['triggers'][objTrigger.name]['inputs'], objTrigger, params)
    }
  } else {
    // throws error if package exists in deployment file but not in manifest file ( no common package names)
    throw new Error('Package name in deployment file not present in manifest file')
  }
  return objTrigger
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

function createActionObject (thisAction, params, objAction) {
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

  if (thisAction.limits) {
    let limits = {
      memory: thisAction.limits['memorySize'] || 256,
      logs: thisAction.limits['logSize'] || 10,
      timeout: thisAction.limits['timeout'] || 60000
    }
    objAction['limits'] = limits
  }
  objAction['annotations'] = returnAnnotations(thisAction)

  if (thisAction['inputs']) {
    // if parameter is provided as key : 'data type' , process it to set default values before deployment
    let processedInput = processInputs(thisAction['inputs'], params)
    objAction['params'] = processedInput
  }
  return objAction
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
        } else if (typeof input[key] === 'string' && input[key].startsWith('$')) {
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
  'deployment': flags.string({
    char: 'd',
    description: 'the path to the deployment file'
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
