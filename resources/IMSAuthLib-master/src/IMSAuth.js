const cookie = require('cookie')
var IMSProfile = require('./IMSProfile.js')
/**
 * Test action
 * @param params
 * @returns {{body: string}}
 */
function main (params) {
  var jwtClientID = params.clientID || null
  var sharedNamespace = params.sharedNamespace || null
  const CONTEXT_COOKIE_NAME = params.cookieName || '__Secure-auth_context'
  var ctx = readCookies(params, CONTEXT_COOKIE_NAME)
  var imsProfile = null
  return new Promise((resolve, reject) => {
    if (ctx.identities.length === 0 || jwtClientID === null) {
      resolve(buildResp('Not logged in or no JWT clientID', 401))
    } else {
      var tokens = ''
      for (var i = 0; i < ctx.identities.length; i++) {
        let ident = ctx.identities[i]
        if (ident !== null && typeof (ident) !== 'undefined') {
          if (ident.provider === 'adobe') {
            var profileID = ident.user_id
            imsProfile = new IMSProfile(profileID, sharedNamespace)
          }
          user.getAccessToken('adobe')
            .then(res => {
              tokens = res.accessToken
              imsProfile = new IMSProfile('JWT' + jwtClientID, sharedNamespace)
              user.getAccessToken('adobe')
                .then(res => {
                  tokens = tokens + ':' + res.accessToken
                  let headers = {
                    'Set-Cookie': '__Secure-auth_context=' + JSON.stringify(ctx) + '; Secure; Max-Age=86400; Path=/api/v1/web/' + process.env['__OW_NAMESPACE']
                  }
                  resolve(buildResp({ 'tokens': tokens }, 200, headers))
                })
                .catch(err => {
                  resolve(buildResp(err.message, 500))
                })
            })
            .catch(err => {
              resolve(buildResp(err.message, 500))
            })
        }
      }
    }
  })
}

function buildResp (message, status, extraHeaders) {
  console.log(message)
  let headers = {
    'content-type': 'application/json',
    'status': status,
    ...extraHeaders
  }
  let bodyJSON = typeof (message) === 'string' ? { message } : message
  return {
    headers,
    body: bodyJSON
  }
}

function readCookies (params, cookieName) {
  var cookies = cookie.parse(params.__ow_headers['cookie'] || '')
  var ctx = cookies[cookieName] ? JSON.parse(cookies[cookieName]) : {}
  ctx.identities = ctx.identities || []
  return ctx
}

exports.main = main
