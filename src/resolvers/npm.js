const spawn = require('spawn-please')
const { packument } = require('pacote')
const get = require('lodash.get')

const mode = 'npm'

const prepare = () => {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return spawn(cmd, ['config', 'list', '--json'])
    .then(out => {
      const opts = JSON.parse(out)
      const { registry, cache } = opts
      return { registry, cache }
    })
}

/**
 * @param {string} pckg - package name
 * @returns {Promise<Versions>}
 */
const versions = (pckg, range, opts) => packument(pckg, opts)
  .then(data => ({
    mode,
    package: pckg,
    range,
    versions: Object.keys(get(data, 'versions', {}))
  }))
  .catch(error => ({
    mode,
    package: pckg,
    range,
    error
  }))

/**
 * selected range
 * @param {object} versionO
 * @returns {string}
 */
const range = (versionO, type) => {
  const v = versionO[type]
  return v
    ? (versionO.wildcard || '') + v
    : versionO.range
}

module.exports = {
  prepare,
  versions,
  range
}
