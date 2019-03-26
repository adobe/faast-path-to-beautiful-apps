const fs = require('fs-extra') // promises
const path = require('path')
const mime = require('mime-types')
const request = require('request-promise')

// s3 utils
/**
 * Checks if s3 prefix exists
 * @param  {} s3Client
 * @param  {string} folder - bucket/path/to/prefix
 * @param  {string} [prefix = '']
 */
async function folderExists (s3Client, bucket, prefix = '') {
  const listParams = {
    Bucket: bucket,
    Prefix: prefix
  }
  const listedObjects = await s3Client.listObjectsV2(listParams).promise()
  return listedObjects.Contents.length !== 0
}
/**
 * Deletes all files in a s3 prefix location
 * @param  {} s3Client
 * @param  {string} bucket
 * @param  {string} [prefix = '']
 */
async function emptyFolder (s3Client, bucket, prefix = '') {
  const listParams = {
    Bucket: bucket,
    Prefix: prefix
  }
  const listedObjects = await s3Client.listObjectsV2(listParams).promise()
  if (listedObjects.Contents.length === 0) return
  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] }
  }
  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })
  await s3Client.deleteObjects(deleteParams).promise()
  if (listedObjects.IsTruncated) await emptyFolder()
}
/**
 * Uploads a file to s3
 * @param  {} s3Client
 * @param  {string} bucket
 * @param  {string} file
 * @param  {string} [prefix = ''] - s3 prefix to upload the file to
 */
async function uploadFile (s3Client, bucket, file, prefix = '') {
  const content = await fs.readFile(file)
  const uploadParams = {
    Bucket: bucket,
    Key: path.join(prefix, path.basename(file)),
    Body: content,
    ACL: 'public-read',
    // s3 misses some mime types like for css files
    ContentType: mime.lookup(path.extname(file))
  }
  return s3Client.upload(uploadParams).promise()
}
/**
 * Uploads all files in a dir to s3 - flat, no recursion support
 * @param  {} s3Client
 * @param  {string} bucket
 * @param  {string} [prefix = ''] - s3 prefix to upload the dir to
 * @param  {string} dir - directory with files to upload
 * @param  {function} [postFileUploadCallback] - called for each uploaded file
 */
async function uploadDir (s3Client, bucket, prefix = '', dir, postFileUploadCallback) {
  async function _filterFiles (files) {
    const bools = await Promise.all(files.map(async f => (await fs.stat(f)).isFile()))
    return files.filter(f => bools.shift())
  }

  const files = await _filterFiles((await fs.readdir(dir)).map(f => path.join(dir, f)))

  // parallel upload
  return Promise.all(files.map(async f => {
    const s3Res = await uploadFile(s3Client, bucket, f, prefix)
    if (postFileUploadCallback) postFileUploadCallback(f)
    return s3Res
  }))
}

async function getS3Credentials (tvmUrl, owNamespace, owAuth, cacheCredsFile = '') {
  async function _cacheCredentialsToFile (cacheCredsFile, creds) {
    if (!cacheCredsFile) return null
    fs.writeFileSync(cacheCredsFile, JSON.stringify(creds))
    return true
  }
  async function _getCredentialsFromTVM (tvmUrl, owNamespace, owAuth) {
    return request(tvmUrl, {
      json: {
        owNamespace: owNamespace,
        owAuth: owAuth
      }
    })
  }

  function _getCredentialsFromCacheFile (cacheCredsFile) {
    if (!cacheCredsFile) return null

    try {
      const creds = require(cacheCredsFile)
      if (Date.parse(creds.expiration) < Date.now()) return null
      return creds
    } catch (e) {
      return null
    }
  }

  let creds = _getCredentialsFromCacheFile(cacheCredsFile)
  if (!creds) {
    creds = await _getCredentialsFromTVM(tvmUrl, owNamespace, owAuth)
    _cacheCredentialsToFile(cacheCredsFile, creds)
  }
  return creds
}

module.exports = {
  s3: {
    folderExists: folderExists,
    emptyFolder: emptyFolder,
    uploadFile: uploadFile,
    uploadDir: uploadDir
  },
  getS3Credentials: getS3Credentials
}
