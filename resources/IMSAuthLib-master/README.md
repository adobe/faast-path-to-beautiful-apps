# IMSAuthLib

This module is to help CNA developers allow 
- app users to login using IMS (This is done by creating server-side authentication flow using grant type of auth_code) 
- apps to authenticate with IMS using JWT. 

The following runtime artifacts will be created in your namespace (one for each auth flow).
- A runtime package with binding to oauth/jwt action from shared namespace.
- A sequence for oauth/jwt workflow which takes care of persisting the tokens.

## Configuration
The configuration is based on an .env file in the module's root folder.
Create an .env file in root dir with following parameters.

### For grant type of auth_code
```
OW_NAMESPACE="<change-me>"
OAUTH_API_KEY=<API_KEY of OAUTH integration in IO console>
CLIENT_SECRET=<client_secret of above integration>
REDIRECT_URL=https://runtime.adobe.io/
COOKIE_PATH='<cookie path for the cookie which stores the identity of logged in user>'
```

### For JWT
```
OW_NAMESPACE="<change-me>"
JWT_API_KEY=<API_KEY of Service account integration in IO console>
JWT_CLIENT_SECRET=<client_secret of above integration>
REDIRECT_URL=https://runtime.adobe.io/
```
In addition to the above configuration, for JWT, you need to edit jwt.json file (located in the module's root folder).
You can find the payload and secret in JWT tab of your integration in IO Console.

## Deployment

### For grant type of auth_code
```
npm install
npm run deploy
```

### For JWT
```
npm install
npm run deploy-jwt
```
