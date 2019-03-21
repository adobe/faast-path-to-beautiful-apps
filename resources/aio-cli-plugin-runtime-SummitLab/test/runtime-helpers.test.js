/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TheHelper = require('../src/runtime-helpers.js')

describe('RuntimeHelper has the right functions', () => {
  test('exports', () => {
    expect(typeof TheHelper).toEqual('object')
    expect(typeof TheHelper.createKeyValueArrayFromFile).toEqual('function')
    expect(typeof TheHelper.createKeyValueArrayFromFlag).toEqual('function')
    expect(typeof TheHelper.createKeyValueObjectFromFile).toEqual('function')
    expect(typeof TheHelper.createKeyValueObjectFromFlag).toEqual('function')
    expect(typeof TheHelper.parsePathPattern).toEqual('function')
  })
})

describe('createKeyValueArrayFromFlag', () => {
  test('fail when flag length is odd', (done) => {
    try {
      TheHelper.createKeyValueArrayFromFlag(['key1'])
      done.fail('should throw an error')
    } catch (err) {
      expect(err).toMatchObject(new Error('Please provide correct values for flags'))
      done()
    }
  })
  test('array of key:value (string) pairs', () => {
    let res = TheHelper.createKeyValueArrayFromFlag(['name1', 'val1', 'name2', 'val2'])
    expect(res).toMatchObject([{ key: 'name1', value: 'val1' }, { key: 'name2', value: 'val2' }])
  })
  test('array of key:value (object) pairs', () => {
    let res = TheHelper.createKeyValueArrayFromFlag(['name1', '["val0","val1"]', 'name2', 'val2'])
    expect(typeof res[0].value).toEqual('object')
    expect(res).toMatchObject([{ key: 'name1', value: ['val0', 'val1'] }, { key: 'name2', value: 'val2' }])
  })
})

describe('createKeyValueObjectFromFlag', () => {
  test('fail when flag length is odd', (done) => {
    try {
      TheHelper.createKeyValueObjectFromFlag(['key1'])
      done.fail('should throw an error')
    } catch (err) {
      expect(err).toMatchObject(new Error('Please provide correct values for flags'))
      done()
    }
  })
  test('array of key:value (string) pairs', () => {
    let res = TheHelper.createKeyValueObjectFromFlag(['name1', 'val1', 'name2', 'val2'])
    expect(res).toMatchObject({ 'name1': 'val1', 'name2': 'val2' })
  })
  test('array of key:value (object) pairs', () => {
    let res = TheHelper.createKeyValueObjectFromFlag(['name1', '["val0","val1"]', 'name2', 'val2'])
    expect(typeof res).toEqual('object')
    expect(res).toMatchObject({ 'name1': ['val0', 'val1'], 'name2': 'val2' })
  })
})

describe('createKeyValueArrayFromFile', () => {
  // expect(Vishal)toWriteThis()
})

describe('createKeyValueObjectFromFile', () => {
  // expect(Vishal)toWriteThis()
})

describe('parsePathPattern', () => {
  // expect(Vishal)toWriteThis()
})
