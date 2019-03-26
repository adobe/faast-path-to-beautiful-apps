const fs = require('fs')

/**
 * @description returns key value array from the parameters supplied. Used to create --param and --annotation key value pairs
 * @param flag : flags.param or flags.annotation
 * @returns An array of key value pairs in this format : [{key : 'Your key 1' , value: 'Your value 1'}, {key : 'Your key 2' , value: 'Your value 2'} ]
 */
function createKeyValueArrayFromFlag (flag) {
  if (flag.length % 2 === 0) {
    let i
    let tempArray = []
    for (i = 0; i < flag.length; i += 2) {
      let obj = {}
      obj['key'] = flag[i]
      try {
        // assume it is JSON, there is only 1 way to find out
        obj['value'] = JSON.parse(flag[i + 1])
      } catch (ex) {
        // hmm ... not json, treat as string
        obj['value'] = flag[i + 1]
      }
      tempArray.push(obj)
    }
    return tempArray
  } else {
    throw (new Error('Please provide correct values for flags'))
  }
}

/**
 * @description returns key value array from the json file supplied. Used to create --param-file and annotation-file key value pairs
 * @param file : flags['param-file'] or flags['annotation-file]
 * @returns An array of key value pairs in this format : [{key : 'Your key 1' , value: 'Your value 1'}, {key : 'Your key 2' , value: 'Your value 2'} ]
 */
function createKeyValueArrayFromFile (file) {
  let jsonData = fs.readFileSync(file)
  let jsonParams = JSON.parse(jsonData)
  let tempArray = []
  Object.entries(jsonParams).forEach(
    ([key, value]) => {
      let obj = {}
      obj['key'] = key
      obj['value'] = value
      tempArray.push(obj)
    }
  )
  return tempArray
}

/**
 * @description returns key value pairs in an object from the parameters supplied. Used to create --param and --annotation key value pairs
 * @param flag : flags.param or flags.annotation
 * @returns An object of key value pairs in this format : {Your key1 : 'Your Value 1' , Your key2: 'Your value 2'}
 */
function createKeyValueObjectFromFlag (flag) {
  if (flag.length % 2 === 0) {
    let i
    let tempObj = {}
    for (i = 0; i < flag.length; i += 2) {
      try {
        // assume it is JSON, there is only 1 way to find out
        tempObj[flag[i]] = JSON.parse(flag[i + 1])
      } catch (ex) {
        // hmm ... not json, treat as string
        tempObj[flag[i]] = flag[i + 1]
      }
    }
    return tempObj
  } else {
    throw (new Error('Please provide correct values for flags'))
  }
}
/**
 * @description returns key value pairs from the parameters supplied. Used to create --param-file and --annotation-file key value pairs
 * @param file : flags['param-file'] or flags['annotation-file']
 * @returns An object of key value pairs in this format : {Your key1 : 'Your Value 1' , Your key2: 'Your value 2'}
 */
function createKeyValueObjectFromFile (file) {
  let jsonData = fs.readFileSync(file)
  return JSON.parse(jsonData)
}

function createComponentsfromSequence (sequenceAction, ns) {
  let objSequence = {}
  objSequence['kind'] = 'sequence'
  // The components array requires fully qualified names [/namespace/package_name/action_name] of all the actions passed as sequence
  sequenceAction = sequenceAction.map(sequence => {
    return `/${ns}/${sequence}`
  })
  objSequence['components'] = sequenceAction
  return objSequence
}

function returnIntersection (firstObject, secondObject) {
  return Object.keys(firstObject).filter(key => key in secondObject)
}

function parsePathPattern (path) {
  const pattern = /^\/(.+)\/(.+)$/i
  let defaultMatch = [ null, null, path ]

  return (pattern.exec(path) || defaultMatch)
}

module.exports = {
  createKeyValueArrayFromFile,
  createKeyValueArrayFromFlag,
  createKeyValueObjectFromFlag,
  createKeyValueObjectFromFile,
  parsePathPattern,
  createComponentsfromSequence,
  returnIntersection
}
