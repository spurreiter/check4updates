const spawn = require('./spawn.js')
const { packument } = require('pacote')
const get = require('lodash.get')
const log = require('debug')('check4updates:resolvers:npm')

/** @typedef {import('../types.js').Result} Result */

const mode = 'npm'

const prepare = () => {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return spawn(cmd, ['config', 'list', '--json'])
    .then(out => {
      const opts = JSON.parse(out)
      // @see https://docs.npmjs.com/cli/v9/using-npm/config#strict-ssl
      //
      opts.strictSSL = !!opts['strict-ssl']
      return opts
    })
}

/**
 * @param {string} pckg - package name
 * @returns {Promise<Result>}
 */
const versions = (pckg, range, opts) => packument(pckg, opts)
  .then(data => {
    const versions = Object.keys(get(data, 'versions', {}))
    const latest = get(data, 'dist-tags.latest')
    log('%j', { pckg, latest, versions })
    return {
      mode,
      package: pckg,
      range,
      latest,
      versions
    }
  })
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
