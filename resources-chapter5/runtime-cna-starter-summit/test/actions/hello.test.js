/* eslint-env mocha */

const assert = require('assert')
const action = require('../../actions/hello')

describe('Action: hello', () => {
  describe('main', () => {
    it('should return content type json', () => {
      const response = action.main({})
      assert.strictEqual(response.headers['content-type'], 'application/json')
    })

    it('should return default message', () => {
      const response = action.main({})
      assert.strictEqual(response.body.message, 'you didn\'t tell me who you are.')
    })

    it('should greet with name', () => {
      const response = action.main({ name: 'Atreus' })
      assert.strictEqual(response.body.message, 'hello Atreus!')
    })
  })
})
