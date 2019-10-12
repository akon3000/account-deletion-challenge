import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import MockDataProvider from './MockDataProvider'
import TerminateModalFlow from './TerminateModalFlow.react'

console.log(process.env.API_KEY, process.env.NODE_ENV)

ReactDOM.render(
  <MockDataProvider>
    {props => <TerminateModalFlow {...props} />}
  </MockDataProvider>,
  document.getElementById('root')
)

// Hot Module Replacement
if (module.hot) {
  module.hot.accept()
}
