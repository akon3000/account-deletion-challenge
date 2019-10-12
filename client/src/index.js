import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import MockDataContext from './contexts/MockDataContext'
import TerminateModalFlow from './containers/TerminateModalFlow'

ReactDOM.render(
  <MockDataContext>
    {props => <TerminateModalFlow {...props} />}
  </MockDataContext>,
  document.getElementById('root')
)

// Hot Module Replacement
if (module.hot) {
  module.hot.accept()
}
