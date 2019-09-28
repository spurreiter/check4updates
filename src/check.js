const { eachLimit } = require('asyncc-promise')
const { PckgJson } = require('./PckgJson')
const { resolverPrepare, resolver, resolverRange } = require('./resolvers')
const { maxSatisfying } = require('./semver')
const { incexc } = require('./incexc')
const log = require('debug')('check4updates:check')

const queryVersions = (progressBar, dirname, npmOpts) => packages => {
  return resolverPrepare(npmOpts)
    .then(({ npmOpts }) => {
      log(npmOpts)
      log(packages)
      const total = Object.keys(packages).length
      const progress = total && progressBar && progressBar(total)
      const limit = Math.min(50, total)

      return eachLimit(limit, Object.entries(packages), ([pckg, range]) => {
        return resolver(pckg, range, { dirname, npmOpts })
          .then(data => {
            progress && progress.tick()
            return data
          })
      })
    })
}

const calcVersions = results => {
  return results.map(pckg => {
    log('package "%s"', pckg.package)
    const res = Object.assign(
      {},
      pckg,
      maxSatisfying(pckg.versions, pckg.range, pckg.latest)
    )
    return res
  })
}

const calcRange = ({ patch, minor, major, max }) => results => {
  const type = patch
    ? 'patch'
    : minor
      ? 'minor'
      : major
        ? 'major'
        : max
          ? 'max'
          : 'latest'
  const packages = resolverRange(results, type)
  log('packages', packages)
  return { results, packages, type }
}

const updatePckg = (update, pckg) => ({ results, packages, type }) => {
  if (update) {
    return pckg.write(packages).then(() => ({ results, type }))
  }
  return { results, type }
}

/**
 * @returns {Promise} `{ results: object, type: string }`
 */
function check ({
  dirname,
  update,
  include,
  exclude,
  prod,
  dev,
  peer,
  patch,
  minor,
  major,
  latest,
  max,
  cli,
  progressBar
} = {}) {
  dirname = dirname || process.cwd()
  const pckg = new PckgJson({ dirname })
  const npmOpts = {} // future use
  return pckg.read({ prod, dev, peer })
    .then(packages => incexc({ packages, include, exclude }))
    .then(queryVersions(progressBar, dirname, npmOpts))
    .then(calcVersions)
    .then(calcRange({ patch, minor, major, max }))
    .then(updatePckg(update, pckg))
}

module.exports = {
  check
}
