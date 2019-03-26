import API from '../config'

import { AppError, RequestValidationError } from './Errors'

const Action = {}

/**
 * Invokes a web action and returns the response.
 * @param  {string} actionName
 * @param  {object} params
 * @param  {bool} errorNotJsonResponse
 */
Action.webInvoke = async function (actionName, params, errorNotJsonResponse) {
  if (!actionName || !API[actionName]) {
    throw new RequestValidationError({ actionName: actionName })
  }

  if (params && typeof params !== 'object') {
    throw new RequestValidationError({ params: params })
  }

  const response = await fetch(API[actionName], params && {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })

  let content
  try {
    content = await response.text()
  } catch (e) {
    throw new AppError('Reponse from ' + API[actionName] + ' could not be parsed.', 500)
  }
  try {
    content = JSON.parse(content)
  } catch (e) {
    if (errorNotJsonResponse) {
      throw new AppError('Response from ' + API[actionName] + ' is not a valid JSON.', 500)
    }
  }

  if (!response.ok) {
    throw new AppError(content, response.status)
  }

  return content
}

export default Action
