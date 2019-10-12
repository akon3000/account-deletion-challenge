import React from 'react'
import PropTypes from 'prop-types'

const Input = ({
  type,
  onChange,
  placeholder,
  errorMessage,
  ...rest
}) => (
  <div>
    <input
      {...rest}
      type={type}
      onChange={onChange}
      placeholder={placeholder}
    />
    <span style={{ color: 'red' }}>{errorMessage}</span>
  </div>
)

Input.propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string
}

Input.defaultProps = {
  type: 'text',
  placeholder: '',
  errorMessage: '',
}

export default Input