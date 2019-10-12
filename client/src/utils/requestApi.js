const handleRequestQuery = query => {
  if (!query) return ''

  if (typeof query !== 'object') return ''

  const filters = Object.keys(query).map(key => `${key}=${query[key]}`)

  return `?${filters.join('&')}`
}

const send = async (url, options) => {
  const {
    body,
    query,
    headers = {},
    mode = 'cors',
    ...rest
  } = options

  const targetUrl = `${url}${handleRequestQuery(query)}`

  const option = {
    ...rest,
    mode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  }

  const response = await window.fetch(targetUrl, option)

  if (!response.ok) throw response
  
  return response
}

export const get = (url, options = {}) => send(url, { ...options, method: 'GET' })

export const post = (url, options = {}) => send(url, { ...options, method: 'POST' })

export const put = (url, options = {}) => send(url, { ...options, method: 'PUT' })

export const del = (url, options = {}) => send(url, { ...options, method: 'DELETE' })

export default { get, post, put, del }