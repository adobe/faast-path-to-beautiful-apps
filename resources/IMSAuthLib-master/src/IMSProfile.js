
var openwhisk = require('openwhisk')
var _resolve = null

class User {
  constructor (profileID, sharedNamespace) {
    openwhisk()
    this.profileID = profileID
    this.sharedNamespace = sharedNamespace
  }

  getProfile (provider) {
    return new Promise((resolve, reject) => {
      _resolve = resolve
      var ow = openwhisk()
      ow.actions.invoke({ actionName: '/'+this.sharedNamespace+'/cache/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider } })
        .then(res => {
          _resolve(res.response.result.profile)
        })
        .catch(err => { console.error(err) })
    })
  }

  getAccessToken (provider) {
    return new Promise((resolve, reject) => {
      _resolve = resolve
      var ow = openwhisk()
      ow.actions.invoke({ actionName: '/'+this.sharedNamespace+'/cache/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider } })
        .then(res => {
          console.log(res)
          var profile = res
          console.log('AccessToken is valid')
          _resolve({ accessToken: profile.accessToken })
        })
        .catch(err => { console.error('failed to get the accessToken', err); _resolve(err) })
    })
  }

  clearTokens (provider) {
    return new Promise((resolve, reject) => {
      _resolve = resolve
      var ow = openwhisk()
      ow.actions.invoke({ actionName: '/'+this.sharedNamespace+'/cache/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider, delete: true } })
        .then(res => {
          _resolve({ message: 'Profile successfully deleted.' })
        })
    })
  }
}

module.exports = User
