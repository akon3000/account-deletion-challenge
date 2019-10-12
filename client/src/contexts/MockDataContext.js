import React from 'react'

import * as LoadState from '../LoadState'
import requestApi from '../utils/requestApi'

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
    try {
      const response = await requestApi.get(`${API_KEY}/fetchWorkspaces`, {
        query: {
          userId: this.state.user._id
        }
      })
      const data = await response.json()
      this.setState({
        loading: false,
        requiredTransferWorkspaces: data.requiredTransferWorkspaces,
        deleteWorkspaces: data.deleteWorkspaces,
      })
    } catch (err) {
      alert(`Error status ${err.status}`)
    }
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
        try {
          const response = await requestApi.post(`${API_KEY}/checkOwnership`, {
            body: {
              workspaceId: workspace.spaceId,
              fromUserId: this.state.user._id,
              toUserId: user._id,
            }
          })
          if (response.status === 200) {
            this.setState({
              transferOwnershipStatus: {
                workspaceId: workspace.spaceId,
                toUserId: user._id,
                ...LoadState.completed,
              },
            })
          }
        } catch (err) {
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
    try {
      // Note that there is 30% chance of getting error from the server
      const response = await requestApi.post(`${API_KEY}/terminateAccount`, {
        body: payload
      })
      if (response.status === 200) {
        this.setState({
          terminateAccountStatus: LoadState.handleLoaded(
            this.state.terminateAccountStatus
          ),
        })
      }
    } catch (err) {
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