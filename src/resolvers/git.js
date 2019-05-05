const spawn = require('spawn-please')

const { fromUrl } = require('hosted-git-info')

const log = require('debug')('check4updates:resolvers:git')

const mode = 'git'

const RE_VERSION = /([0-9]+\.[0-9]+\.[0-9]+(?:-.*|))/

/**
 * @private
 */
const hostedUrl = range => {
  const o = fromUrl(range)
  return o && o.https()
    .replace(/^git\+/, '')
    .replace(/#[^/]*$/, '')
}

const getSemver = val => (RE_VERSION.exec(val) || [])[1]

const gitRemoteTags = range => {
  const url = hostedUrl(range)
  const sshurl = url.replace(/^https?:\/\//, 'ssh://git@')
  log(url)
  // try first ssh-url then with the https url
  return spawn('git', ['ls-remote', '--tags', sshurl])
    .catch(() => spawn('git', ['ls-remote', '--tags', url]))
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
