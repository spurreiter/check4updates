const { eachLimit } = require('asyncc-promise')
const semver = require('semver')
const { PckgJson } = require('./PckgJson.js')
const {
  resolverPrepare,
  resolver,
  resolverRange
} = require('./resolvers/index.js')
const { maxSatisfying } = require('./semver.js')
const { incexc } = require('./incexc.js')
const log = require('debug')('check4updates:check')

/** @typedef {import('progress')} ProgressBar */
/** @typedef {import('./types.js').Cli} Cli */
/** @typedef {import('./types.js').Packages} Packages */
/** @typedef {import('./types.js').NpmOptions} NpmOptions */
/** @typedef {import('./types.js').Result} Result */

/**
 * @param {ProgressBar} progressBar
 * @param {string} dirname
 * @param {NpmOptions} npmOpts
 * @returns {(packages: Packages) => Promise<Result[]>}
 */
const queryVersions = (progressBar, dirname, npmOpts) => (packages) => {
  return resolverPrepare(npmOpts).then(({ npmOpts }) => {
    log(npmOpts)
    log(packages)
    const total = Object.keys(packages).length
    const progress = total && progressBar && progressBar(total)
    const limit = Math.min(50, total)

    return eachLimit(limit, Object.entries(packages), ([pckg, range]) => {
      return resolver(pckg, range, { dirname, npmOpts }).then((data) => {
        progress && progress.tick()
        return data
      })
    })
  })
}

/**
 * @param {Result[]} results
 * @returns
 */
const calcVersions = (results) => {
  return results.map((pckg) => {
    log('package "%s"', pckg.package)
    const res = Object.assign(
      {},
      pckg,
      maxSatisfying(pckg.versions, pckg.range, pckg.latest)
    )
    return res
  })
}

const setIgnoredFlag = ({ results, ignored, type }) => {
  if (!ignored) {
    return
  }
  results.forEach((res) => {
    const range = ignored[res.package]
    if (range) {
      const selectedVersion = res[type]
      const satisfies = semver.satisfies(selectedVersion, range)
      if (!satisfies) {
        res.ignore = true
      }
    }
  })
}

const calcRange =
  ({ pckg, patch, minor, major, max }) =>
  (results) => {
    const type = patch
      ? 'patch'
      : minor
        ? 'minor'
        : major
          ? 'major'
          : max
            ? 'max'
            : 'latest'

    const ignored = pckg.getIgnored()
    setIgnoredFlag({ results, ignored, type })

    const packages = resolverRange(results, type)
    log('packages', packages)
    return { results, packages, type }
  }

const updatePckg =
  (update, pckg) =>
  ({ results, packages, type }) => {
    if (update) {
      return pckg.write(packages).then(() => ({ results, type }))
    }
    const { name, version } = pckg.content
    return { results, type, name, version }
  }

/**
 * @param {Cli} [param0]
 * @returns {Promise} `{ results: object, type: string }`
 */
async function check(param0) {
  const {
    dirname = process.cwd(),
    update,
    include,
    exclude,
    filter,
    filterInv,
    prod,
    dev,
    peer,
    patch,
    minor,
    major,
    // latest,
    max,
    progressBar
  } = param0 || {}
  const pckg = new PckgJson({ dirname })
  const npmOpts = {} // future use
  return pckg
    .read({ prod, dev, peer })
    .then((packages) =>
      incexc({ packages, include, exclude, filter, filterInv })
    )
    .then(queryVersions(progressBar, dirname, npmOpts))
    .then(calcVersions)
    .then(calcRange({ pckg, patch, minor, major, max }))
    .then(updatePckg(update, pckg))
}

module.exports = {
  check
}
