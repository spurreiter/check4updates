const { eachLimit } = require('asyncc-promise')
const { PckgJson } = require('./PckgJson')
const { factory, factoryRange } = require('./resolvers')
const { maxSatisfying } = require('./semver')
const { incexc } = require('./incexc')
const log = require('debug')('check4updates:check')

const queryVersions = (progressBar, dirname) => packages => {
  log(packages)
  const total = Object.keys(packages).length
  const progress = total && progressBar && progressBar(total)
  const limit = Math.min(10, total / 2 | 0)

  return eachLimit(limit, Object.entries(packages), ([pckg, range]) => {
    progress && progress.tick()
    return factory(pckg, range, { dirname })
  })
}

const calcVersions = results => {
  return results.map(pckg => {
    log('package "%s"', pckg.package)
    const res = Object.assign({}, pckg, maxSatisfying(pckg.versions, pckg.range))
    return res
  })
}

const calcRange = (patch, minor, major) => results => {
  const type = patch
    ? 'patch'
    : minor
      ? 'minor'
      : major
        ? 'major'
        : 'max'
  const packages = factoryRange(results, type)
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
  dep,
  dev,
  peer,
  patch,
  minor,
  major,
  cli,
  progressBar
} = {}) {
  dirname = dirname || process.cwd()
  const pckg = new PckgJson({
    dirname
  })
  return pckg.read({ dep, dev, peer })
    .then(packages => incexc({ packages, include, exclude }))
    .then(queryVersions(progressBar, dirname))
    .then(calcVersions)
    .then(calcRange(patch, minor, major))
    .then(updatePckg(update, pckg))
}

module.exports = {
  check
}
