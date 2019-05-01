const { packument } = require('pacote')
const get = require('lodash.get')

const mode = 'npm'

/**
 * @param {string} pckg - package name
 * @returns {Promise<Versions>}
 */
const versions = (pckg, range) => packument(pckg)
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
  versions,
  range
}
