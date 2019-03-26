import '@babel/polyfill'
import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'
import Provider from '@react/react-spectrum/Provider'

// Render it!
ReactDOM.render(
  <Provider theme='light'>
    <App />
  </Provider>
  , document.getElementById('root'))
