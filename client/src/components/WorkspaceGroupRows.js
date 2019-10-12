import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

const WorkspaceGroupRows = ({
  children,
  groupTitle,
  workspaces,
  shouldDisplay
}) => !shouldDisplay ? null : (
  <div>
    <h3>{groupTitle}</h3>
    <div>
      {
        _.map(workspaces, workspace => (
          <div key={workspace.spaceId} style={{ marginTop: '1rem' }}>
            <span>Workspace: {workspace.displayName}</span>
            <span>
              {React.Children.count(children) === 0
                ? null
                : React.cloneElement(children, { workspace })}
            </span>
          </div>
        ))
      }
    </div>
  </div>
)

WorkspaceGroupRows.propTypes = {
  children: PropTypes.node,
  groupTitle: PropTypes.string,
  shouldDisplay: PropTypes.bool,
  workspaces: PropTypes.array.isRequired
}

export default WorkspaceGroupRows