import React from 'react'

import * as LoadState from '../LoadState'

const { API_KEY } = process.env
const MocDataContext = React.createContext()

class MockDataProvider extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      user: {
        _id: 'user1',
        name: 'Ross Lynch',
        email: 'ross@example.com',
      },
      loading: true,
      requiredTransferWorkspaces: [],
      deleteWorkspaces: [],
      transferableMembers: [],
      transferOwnershipStatus: {
        workspaceId: null,
        toUserId: null,
        ...LoadState.pending,
      },
      terminateAccountStatus: {},
    }
  }

  fetchRelatedWorkspaces = async () => {
    const response = await window.fetch(`${API_KEY}/fetchWorkspaces?userId=${this.state.user._id}`, {
      mode: 'cors',
    })
    const data = await response.json()
    this.setState({
      loading: false,
      requiredTransferWorkspaces: data.requiredTransferWorkspaces,
      deleteWorkspaces: data.deleteWorkspaces,
    })
  }

  transferOwnership = (user, workspace) => {
    this.setState(
      {
        transferOwnershipStatus: {
          workspaceId: workspace.spaceId,
          toUserId: this.state.user._id,
          ...LoadState.loading,
        },
      },
      async () => {
        const response = await window.fetch(`${API_KEY}/checkOwnership`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId: workspace.spaceId,
            fromUserId: this.state.user._id,
            toUserId: user._id,
          }),
        })
        if (response.status === 200) {
          this.setState({
            transferOwnershipStatus: {
              workspaceId: workspace.spaceId,
              toUserId: user._id,
              ...LoadState.completed,
            },
          })
        } else {
          this.setState({
            transferOwnershipStatus: {
              workspaceId: workspace.spaceId,
              toUserId: user._id,
              ...LoadState.error,
            },
          })
        }
      }
    )
  }

  terminateAccount = async payload => {
    // Note that there is 30% chance of getting error from the server
    const response = await window.fetch(`${API_KEY}/terminateAccount`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.status === 200) {
      this.setState({
        terminateAccountStatus: LoadState.handleLoaded(
          this.state.terminateAccountStatus
        ),
      })
    } else {
      this.setState({
        terminateAccountStatus: LoadState.handleLoadFailedWithError(
          'Error deleting account'
        )(this.state.terminateAccountStatus),
      })
    }
  }

  terminateAccountError = error => {
    this.setState({
      terminateAccountStatus: LoadState.handleLoadFailedWithError(error)(
        this.state.terminateAccountStatus
      ),
    })
  }

  resetTerminateAccountStatus = () => {
    this.setState({
      terminateAccountStatus: LoadState.pending,
    })
  }

  redirectToHomepage = () => {
    window.location = 'http://www.example.com/'
  }

  render() {
    return (
      <MocDataContext.Provider
        value={{
          ...this.state,
          fetchRelatedWorkspaces: this.fetchRelatedWorkspaces,
          transferOwnership: this.transferOwnership,
          terminateAccount: this.terminateAccount,
          terminateAccountError: this.terminateAccountError,
          resetTerminateAccountStatus: this.resetTerminateAccountStatus,
          redirectToHomepage: this.redirectToHomepage
        }}
      >
        <MocDataContext.Consumer>
          {this.props.children}
        </MocDataContext.Consumer>
      </MocDataContext.Provider>
    )
  }
}

export default MockDataProvider