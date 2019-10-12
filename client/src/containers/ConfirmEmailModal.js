import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import { isLoading } from '../LoadState'
import Input from '../components/Input'

class ConfirmEmailModal extends React.PureComponent {
  static propTypes = {
    onClickToDelete: PropTypes.func,
    onBackButton: PropTypes.func,
    email: PropTypes.string,
    onTypeEmail: PropTypes.func,
    resetTerminateAccountStatus: PropTypes.func,
    terminateAccountStatus: PropTypes.object,
  }

  state = { markedConsequences: false }

  componentWillUnmount() {
    this.props.resetTerminateAccountStatus()
  }

  getStateButton = () => {
    if (isLoading(this.props.terminateAccountStatus)) return true
    if (this.state.markedConsequences && this.props.email) return false
    return true
  }

  onToggleMarkedConsequences = () => {
    this.setState({ markedConsequences: !this.state.markedConsequences })
  }

  render() {
    const errorMessage = _.get(this.props.terminateAccountStatus, 'error', null)

    return (
      <div>
        <h1>Delete account</h1>
        <p>This action cannot be undone.</p>
        <div>
          Please enter your email:
          <Input
            style={{ width: '350px' }}
            errorMessage={errorMessage}
            placeholder='ross@example.com'
            onChange={this.props.onTypeEmail}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={this.state.markedConsequences}
              onChange={this.onToggleMarkedConsequences}
            />
            I understand the consequences.
          </label>
        </div>
        <div>
          <button onClick={this.props.onBackButton}>Back</button>
          <button
            onClick={this.props.onClickToDelete}
            disabled={this.getStateButton()}
          >
            Delete my account
          </button>
        </div>
      </div>
    )
  }
}

export default ConfirmEmailModal
