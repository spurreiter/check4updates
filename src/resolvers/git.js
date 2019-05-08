const spawn = require('spawn-please')

const { fromUrl } = require('hosted-git-info')

const log = require('debug')('check4updates:resolvers:git')

const mode = 'git'

const RE_VERSION = /([0-9]+\.[0-9]+\.[0-9]+(?:-.*|))/

/**
 * @private
 */
const hostedUrl = range => {
  let url
  const hgi = fromUrl(range)
  if (hgi) {
    if (hgi.default === 'sshurl') {
      // git+ssh://git@github.com/account/repo.git#v6.1.0
      url = hgi.sshurl()
    } else {
      // github:account/repo.git#v6.1.0
      // https://github.com/account/repo.git#v6.1.0
      url = hgi.https().replace(/^git\+/, '')
    }
    url = url.replace(/#[^/]*$/, '')
  }
  return url
}

const getSemver = val => (RE_VERSION.exec(val) || [])[1]

const gitRemoteTags = range => {
  const url = hostedUrl(range)
  log(url)
  return spawn('git', ['ls-remote', '--tags', url])
}

/**
 * test for file resolver
 * @param {string} range
 */
const test = range => {
  const url = hostedUrl(range)
  return !!url
}

/**
 * get versions from path obtained by dirname and range
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `file: ... .tgz`
 * @param {object} param2
 * @param {object} param2.dirname - actual dirname of package.json
 * @returns {Promise<Versions>}
 */
const versions = (pckg, range) => {
  if (!test(range)) return Promise.reject(new Error(`${pckg}: no git url provided `))

  const _range = range // store org value
  // create semver range
  range = getSemver(_range)
  range = range ? '^' + range : '*'

  return gitRemoteTags(_range)
    .then(tags => {
      const _versions = tags.split(/[\r\n]/)
        .map(t => {
          const [ _0, ref ] = t.split(/\s+/) // eslint-disable-line no-unused-vars
          return getSemver(ref)
        })
        .filter(Boolean)
      const versions = Array.from(new Set(_versions))
      log(versions)

      return {
        mode,
        package: pckg,
        _range,
        range,
        versions
      }
    })
    .catch(error => ({
      mode,
      package: pckg,
      _range,
      range,
      error
    }))
}

/**
 * return selected range
 * @param {object} versionO
 * @returns {string}
 */
const range = (versionO, type) => {
  const v = versionO[type]
  return v
    ? versionO._range.replace(RE_VERSION, v)
    : versionO._range
}

module.exports = {
  test,
  versions,
  range,
  hostedUrl
}
