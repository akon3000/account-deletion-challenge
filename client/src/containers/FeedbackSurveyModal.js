import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import feedbackSurveyItems from '../feedbackSurveyItems.json'

class FeedbackSurveyModal extends React.PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func,
    onBackButton: PropTypes.func,
    title: PropTypes.node,
    showCommentForm: PropTypes.bool,
    comment: PropTypes.string,
    onChangeComment: PropTypes.func,
  }

  constructor(props) {
    super(props)

    this.state = this.setInitialState()
    this.feedbackRefs = {}
  }

  state = {
    isFocusCommentBox: false,
  }

  setInitialState = () => {
    return _.chain(feedbackSurveyItems)
      .map(item => [item.stack, false])
      .fromPairs()
      .value()
  }

  hasAllUnchecked = () => {
    const FeedbackSurveyItems = this.state
    return (
      _.every(FeedbackSurveyItems, val => val === false) &&
      !this.state.isFocusCommentBox
    )
  }

  onToggleFeedback(stack) {
    this.setState({ [stack]: !this.state[stack] })
  }

  onFocusCommentBox = () => {
    this.setState({ isFocusCommentBox: !this.state.isFocusCommentBox })
  }

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <div>
          {
            _.map(feedbackSurveyItems, (item, key) => (
              <div key={key}>
                <label>
                  <input
                    type='checkbox'
                    checked={this.state[item.stack]}
                    onChange={() => this.onToggleFeedback(item.stack)}
                  />
                  {item.title}
                </label>
                {this.state[item.stack] &&
                  <div>
                    <input
                      type='text'
                      name={item.stack}
                      placeholder={item.placeHolder || ''}
                      ref={el => { this.feedbackRefs[item.stack] = el }}
                      style={!item.canComment ? { display: 'none' } : null}
                    />
                  </div>
                }
              </div>
            ))
          }
        </div>
        {this.props.showCommentForm &&
          <div style={{ marginTop: '2rem' }}>
            Comments:
            <div>
              <textarea
                type='text'
                name='comment'
                style={
                  this.state.isFocusCommentBox
                    ? { border: '1px solid blue' }
                    : { border: '1px solid black' }
                }
                value={this.props.comment}
                onChange={this.props.onChangeComment}
              />
            </div>
          </div>
        }
        <div>
          <button onClick={this.props.onBackButton}>Back</button>
          <button onClick={this.props.onSubmit} disabled={this.hasAllUnchecked()}>
            Next
          </button>
        </div>
      </div>
    )
  }
}

export default FeedbackSurveyModal
