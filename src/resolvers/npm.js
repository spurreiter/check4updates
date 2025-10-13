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
 * @param {string} range - semver range
 * @param {object} opts - options
 * @returns {Promise<Result>}
 */
const versions = (pckg, range, opts) => packument(pckg, { fullMetadata: true, ...opts })
  .then(data => {
    const fetchedVersions = Object.keys(get(data, 'versions', {}))
    let latest = get(data, 'dist-tags.latest')
    const times = get(data, 'time', {})
    const { minReleaseAge = 0 } = opts || {}

    let versions = fetchedVersions

    if (minReleaseAge > 0) {
      const cutoff = Date.now() - (minReleaseAge * 24 * 60 * 60e3)
      log('filtering before %j', { pckg, cutoff, minReleaseAge })
      versions = fetchedVersions.filter(v => {
        const t = new Date(times[v]).getTime()
        return t <= cutoff
      })
      log('versions before: %j', fetchedVersions)
      log('versions after:  %j', versions)

      // update latest if filtered out
      if (latest && versions.indexOf(latest) === -1) {
        const filteredLatest = versions
          .map(v => ({ v, t: new Date(times[v]).getTime() }))
          .sort((a, b) => b.t - a.t)[0]
        if (filteredLatest) {
          log('updating latest from %s to %s', latest, filteredLatest.v)
          latest = filteredLatest.v
        } else {
          log('no versions left after filtering, clearing latest')
          latest = undefined
        }
      }
    }

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
