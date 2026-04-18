const spawn = require('./spawn.js')
const { packument } = require('pacote')
const get = require('lodash.get')
const log = require('debug')('check4updates:resolvers:npm')

/** @typedef {import('../types.js').Result} Result */

const isDate = (d) => d instanceof Date && !isNaN(d.getTime())
const DAY = 24 * 60 * 60e3

const mode = 'npm'

const prepare = (spawnOpts) => {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return spawn(cmd, ['config', 'list', '--json'], spawnOpts)
    .then(out => {
      const npmConfig = JSON.parse(out)
      // Only pass options that pacote recognizes
      // @see https://docs.npmjs.com/cli/v9/using-npm/config#strict-ssl
      const opts = {
        strictSSL: !!npmConfig['strict-ssl']
      }
      
      // Read min-release-age from npm config (e.g., from .npmrc)
      // and convert it to minReleaseAge - this is NOT passed to pacote

      if (npmConfig.before) {
        const beforeDate = npmConfig.before && new Date(npmConfig.before)
        if (isDate(beforeDate) && beforeDate > 0) {
          opts.minReleaseAge = Math.floor(Math.max(0, new Date().getTime() - beforeDate.getTime()) / DAY)
          log('min-release-age from .npmrc: %d days', opts.minReleaseAge)
        }
      }
      
      return opts
    })
}

/**
 * @param {string} pckg - package name
 * @param {string} range - semver range
 * @param {object} opts - options
 * @returns {Promise<Result>}
 */
const versions = (pckg, range, opts) => {
  // Extract minReleaseAge separately so it doesn't get passed to pacote
  const { minReleaseAge = 0, ...pacoteOpts } = opts || {}
  
  return packument(pckg, { fullMetadata: true, ...pacoteOpts })
    .then(data => {
      const fetchedVersions = Object.keys(get(data, 'versions', {}))
      let latest = get(data, 'dist-tags.latest')
      const times = get(data, 'time', {})

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
}

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
