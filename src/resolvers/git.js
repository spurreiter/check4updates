const spawn = require('./spawn.js')

const { fromUrl } = require('hosted-git-info')

const log = require('debug')('check4updates:resolvers:git')

/** @typedef {import('../types.js').Result} Result */

const mode = 'git'

const RE_VERSION = /([0-9]+(?:\.[0-9]+(?:\.[0-9]+|)|)(?:-[^{}^]*|))/
const RE_SEMVER_RANGE = /#semver:([~^]|)([0-9]+(?:\.[0-9]+(?:\.[0-9]+|)|)(?:-[^{}^]*|))/

/**
 * @private
 */
const hostedUrl = range => {
  let url
  const hgi = fromUrl(range, { allowOtherHosts: true })
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

const getSemver = val => {
  const sv = RE_SEMVER_RANGE.exec(val)
  if (sv && sv[2]) return sv[2]
  return (RE_VERSION.exec(val) || [])[1]
}

const getSemverRange = val => (RE_SEMVER_RANGE.exec(val) || []).slice(1)

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
 * get versions from git obtained by range
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `file: ... .tgz`
 * @returns {Promise<Result>}
 */
const versions = (pckg, range) => {
  if (!test(range)) return Promise.reject(new Error(`${pckg}: no git url provided `))

  const _range = range // store org value
  // create semver range
  range = getSemver(_range)
  const svRange = getSemverRange(_range)[0] || '^'
  range = range ? svRange + range : '*'

  return gitRemoteTags(_range)
    .then(tags => {
      const _versions = tags.split(/[\r\n]/)
        .map(t => {
          const [_0, ref] = t.split(/\s+/) // eslint-disable-line no-unused-vars
          return getSemver(ref)
        })
        .filter(Boolean)
      const versions = Array.from(new Set(_versions))
      log('%j', { pckg, versions })

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
  hostedUrl,
  getSemver
}
