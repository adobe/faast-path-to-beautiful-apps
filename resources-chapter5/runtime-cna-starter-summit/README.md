# Runtime CNA Starter
A starter project for building a cloud native app (CNA) on top of Adobe I/O Runtime.

## Setup
-  Get the latest wskdeploy binary (mac 64) in the root of the repo: 
    ```bash
    curl -L https://github.com/apache/incubator-openwhisk-wskdeploy/releases/download/latest/openwhisk_wskdeploy-latest-mac-amd64.zip -o wskdeploy.zip && \
    mkdir -p tmp && \
    unzip wskdeploy.zip -d tmp && \
    cp tmp/wskdeploy . && \
    rm -rf tmp wskdeploy.zip
    ```

- `npm install`

## Local Dev
- `npm run dev` to start your local Dev server
- App will run on `localhost:9080` by default
- Local dev server uses an expressJS proxy to invoke action code.
- You can invoke your back-end actions defined locally via the url `localhost:9080/actions/<action_name>`

## Test & Coverage
- Run `npm run test` to run tests
- Run `npm run coverage` to generate Code coverage report

## Build & Deploy
- `npm run build` to build your ui:React code and build your actions
- `npm run deploy` to deploy all actions on Runtime and static files to S3

## Dependencies
- wskdeploy for action deployments
- expressJS for local dev
- parcelJS for packaging UI App (React by default) and actions
- s3 for serving static files

## Config

### `package.json `

- We use the `name` and `version` fields for the deployment. Make sure to fill
those out.

### `wskdeploy.yml`

- List your backend actions under the `actions` field within the `__CNA_PACKAGE__`
package placeholder. We will take care of replacing the package name placeholder
by your project name and version.
- For each action, use the `function` field to indicate the path to the action
code.
- More documentation for supported action fields can be found
[here](https://github.com/apache/incubator-openwhisk-wskdeploy/blob/master/specification/html/spec_actions.md#actions).

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `wskdeploy.yml` to point to the **entry file** of your action
   folder. We will use `parcelJS` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
   `package.json` with the action's dependencies. Then set the `function` field
   in `wskdeploy.yml` to point to the **folder** of that action. We will install
   the required dependencies within that directory and `wskdeploy` will zip the
   folder and deploy the zipped action. Use this method if you want to keep your
   action's dependencies separated.

### `.env`

```
OW_APIVERSION=v1
OW_APIHOST=https://adobeioruntime.net
OW_AUTH=<AUTH>
OW_NAMESPACE=<namespace>
S3_TVM=https://adobeioruntime.net/api/v1/web/cna-demo/tvm/get-s3-upload-token
```

### `REMOTE_ACTIONS`
- This variable controls the configuration generation for action URLs used by the
UI.

- `REMOTE_ACTIONS=true npm run dev` to run the UI locally but access
remotely deployed actions.
