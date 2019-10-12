import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

const TransferOwnershipModal = ({
  loading,
  children,
  nextPage,
  disabledNextPage
}) => (
  <div>
    <h1>Transfer ownership</h1>
    <p>
      Before you leaving, it is required to transfer your tasks, projects and
      workspace admin rights to other person.
    </p>
    {loading
      ? (
        <div>Loading...</div>
      ) : children
    }
    <button
      onClick={nextPage}
      disabled={disabledNextPage}
    >
      Next
    </button>
  </div>
)

TransferOwnershipModal.propTypes = {
  loading: PropTypes.bool,
  nextPage: PropTypes.func,
  disabledNextPage: PropTypes.bool,
  children: PropTypes.node.isRequired
}

export default TransferOwnershipModal
