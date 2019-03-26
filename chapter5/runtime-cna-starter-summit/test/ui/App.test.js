/* eslint-env mocha */

import React from 'react'
import { mount } from 'enzyme'
import assert from 'assert'
import App from '../../web-src/src/App'

describe('<App />', () => {
  it('should display h1 tag', () => {
    const wrapper = mount(<App />)
    const h1 = wrapper.find('h1')
    assert.strictEqual(h1.length, 1)
    assert.strictEqual(h1.text(), 'Hello there')
  })
})
