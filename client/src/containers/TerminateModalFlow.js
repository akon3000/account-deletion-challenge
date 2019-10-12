import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import * as LoadState from '../LoadState'
import { submitToSurveyMonkeyDeleteAccount } from '../services/survey'
import AssignOwnership from '../components/AssignOwnership'
import WorkspaceGroupRows from '../components/WorkspaceGroupRows'
import TransferOwnershipContainer from '../components/TransferOwnership'
import ConfirmEmailModal from './ConfirmEmailModal'
import FeedbackSurveyModal from './FeedbackSurveyModal'

const FeedbackSurveyForm = React.forwardRef((props, ref) => (
  <FeedbackSurveyModal {...props} ref={ref} />
))

export default class TerminateModalFlow extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    requiredTransferWorkspaces: PropTypes.array,
    deleteWorkspaces: PropTypes.array,
    fetchRelatedWorkspaces: PropTypes.func,
    transferOwnershipStatus: PropTypes.object,
    transferOwnership: PropTypes.func,
    terminateAccount: PropTypes.func,
    terminateAccountError: PropTypes.func,
    terminateAccountStatus: PropTypes.object,
    resetTerminateAccountStatus: PropTypes.func,
    redirectToHomepage: PropTypes.func,
  }

  state = {
    activeModal: 'transfer',
    transferData: [],
    feedbacks: [],
    comment: '',
    email: '',
  }

  static getDerivedStateFromProps(props) {
    if (LoadState.isLoaded(props.terminateAccountStatus)) {
      props.redirectToHomepage()
    }
    return null
  }

  constructor(props) {
    super(props)

    this.feedbackFormRef = React.createRef()
  }

  componentDidMount() {
    this.props.fetchRelatedWorkspaces()
  }

  getTransferData = () => {
    const { workspaceId, toUserId, status } = this.props.transferOwnershipStatus
    const transferData = this.state.transferData
    const updateData = _.reduce(
      transferData,
      (result, assign) => {
        if (
          assign.workspaceId === workspaceId &&
          assign.toUser._id === toUserId
        ) {
          result.push(Object.assign({}, assign, { status }))
        } else {
          result.push(assign)
        }
        return result
      },
      []
    )
    return updateData
  }

  assignToUser = (workspace, user) => {
    const assigns = _.reject(
      this.getTransferData(),
      assign => assign.workspaceId === workspace.spaceId
    )
    this.setState({
      transferData: [
        ...assigns,
        {
          workspaceId: workspace.spaceId,
          toUser: user,
          ...LoadState.pending,
        },
      ],
    })
  }

  getRefsValues(refs, refName) {
    const items = _.get(refs, refName, false)
    if (!items || _.isEmpty(items)) return {}

    const keys = Object.keys(items)
    const collection = []
    for (const key of keys) {
      if (items[key] !== null) { // user has checked and unchecked after that.
        const value = items[key].value
        collection.push({ key, value })
      }
    }
    return collection
  }

  submitSurvey = feedbackRefs => {
    /**
     * this.refs likely to be removed in one of the future releases.
     * React 16.3 or more than [https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs]
     * 
     * const feedbackRefs = this.getRefsValues(this.refs, 'feedbackForm')
     */

    const surveyPayload = { feedbackRefs, comment: '' }

    submitToSurveyMonkeyDeleteAccount(surveyPayload)
  }

  onSetNextPage = async () => {
    if (this.state.activeModal === 'transfer') {
      this.setState({ activeModal: 'feedback' })
    } else if (this.state.activeModal === 'feedback') {
      const feedbackRefs = this.getRefsValues(this.feedbackFormRef.current, 'feedbackRefs')
      this.submitSurvey(feedbackRefs)
      this.setState({
        activeModal: 'confirm',
        feedbacks: _.map(feedbackRefs, ref => ({
          reason: ref.key,
          comment: ref.value,
        })),
      })
    }
  }

  onGoToPreviousStep = () => {
    if (this.state.activeModal === 'feedback') {
      this.setState({ activeModal: 'transfer' })
    }
    if (this.state.activeModal === 'confirm') {
      this.setState({ activeModal: 'feedback' })
    }
  }

  onAssignToUser = (workspace, user) => {
    this.props.transferOwnership(user, workspace)
    this.assignToUser(workspace, user)
  }

  onChangeComment = e => {
    this.setState({ comment: e.target.value })
  }

  onDeleteAccount = async () => {
    if (this.props.user.email === this.state.email) {
      const payload = {
        transferTargets: _.map(this.getTransferData(), assign => ({
          userId: assign.toUser._id,
          spaceId: assign.workspaceId,
        })),
        reason: this.state.feedbacks,
      }
      this.props.terminateAccount(payload)
    } else {
      const error = 'Invalid email'
      this.props.terminateAccountError(error)
    }
  }

  onTypeEmail = e => {
    this.setState({ email: e.target.value })
  }

  renderTransferModal() {
    const transferData = this.getTransferData()
    const totalAssigned = transferData.length
    const totalWorkspaceRequiredTransfer = this.props.requiredTransferWorkspaces
      .length
    const totalWorkspaceDelete = this.props.deleteWorkspaces.length
    const disabledNextPage =
      totalAssigned < totalWorkspaceRequiredTransfer || this.props.loading
    return (
      <TransferOwnershipContainer
        nextPage={this.onSetNextPage}
        loading={this.props.loading}
        disabledNextPage={disabledNextPage}
      >
        <WorkspaceGroupRows
          workspaces={this.props.requiredTransferWorkspaces}
          groupTitle="The following workspaces require ownership transfer:"
          shouldDisplay={totalWorkspaceRequiredTransfer > 0}
        >
          <AssignOwnership
            user={this.props.user}
            transferData={this.getTransferData()}
            onAssignToUser={this.onAssignToUser}
          />
        </WorkspaceGroupRows>
        <WorkspaceGroupRows
          workspaces={this.props.deleteWorkspaces}
          groupTitle="The following workspaces will be deleted:"
          shouldDisplay={totalWorkspaceDelete > 0}
        />
      </TransferOwnershipContainer>
    )
  }

  render() {
    switch (this.state.activeModal) {
      case 'transfer':
        return this.renderTransferModal()
      case 'feedback':
        return (
          <FeedbackSurveyForm
            ref={this.feedbackFormRef}
            title='Why would you leave us?'
            onSubmit={this.onSetNextPage}
            onBackButton={this.onGoToPreviousStep}
            showCommentForm
            comment={this.state.comment}
            onChangeComment={this.onChangeComment}
          />
        )
      case 'confirm':
        return (
          <ConfirmEmailModal
            onClickToDelete={this.onDeleteAccount}
            onBackButton={this.onGoToPreviousStep}
            email={this.state.email}
            onTypeEmail={this.onTypeEmail}
            terminateAccountStatus={this.props.terminateAccountStatus}
            resetTerminateAccountStatus={this.props.resetTerminateAccountStatus}
          />
        )
    }
  }
}
