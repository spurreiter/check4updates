const semver = require('semver')
const log = require('debug')('check4updates:semver')

const isPreVersion = version => /^\d+\.\d+\.\d+-/.test(version)

const rangeWildcard = range => {
  if (/^~|\d+\.\d+\.x$/.test(range)) {
    return '~'
  } else if (/^[\^]|^\d+\.x\.x$|^\d+\.x$/.test(range)) {
    return '^'
  } else if (/^\d/.test(range)) {
    return ''
  } else {
    return '^'
  }
}

const findNext = (versions, range) => {
  const [min, max] = semver.validRange(range).split(' ')
  if (min && max && /^</.test(max)) {
    const patch = semver.coerce(max)
    log('patch', patch.toString())
    const desc = versions.sort(_sortVersions)
    log('desc', desc)
    for (let i = 1; i < desc.length; i++) {
      if (semver.gt(patch, desc[i])) {
        const next = desc[i - 1]
        log('next %j', next)
        return next
      }
    }
    return desc[desc.length - 1]
  }
  return null
}

const findLatestStable = (sorted) => {
  for (const v of sorted) {
    if (!isPreVersion(v)) return v
  }
}

const _sortVersions = (a, b) => {
  if (semver.gt(a, b)) return -1
  if (a === b) return 0
  return 1
}

/**
 * @typedef {Object} FoundVersions
 * @property {string} type - version range char `^`, '~'
 * @property {string} max - max available version
 * @property {string} latest - latest available version
 * @property {string} major - matching major version
 * @property {string} minor - matching minor version
 * @property {string} patch - matching patch version
 */

/**
 * @param {string[]} versions - list of semver versions
 * @param {string} range - semver range
 * @param {string} latest - latest package version
 * @returns {FoundVersions}
 */
const maxSatisfying = (versions = [], range, latest) => {
  const _range = semver.validRange(range)
  log('range %j', _range)
  if (!_range) {
    return null
  }
  const wildcard = rangeWildcard(range)
  const sorted = versions.sort(_sortVersions)
  const max = sorted[0]

  const satisfies = sorted.filter(v => semver.satisfies(v, _range))
  log('satisfies %j', satisfies)

  const _min = satisfies.length
    ? satisfies[satisfies.length - 1]
    : findNext(sorted, range)
  const _max = satisfies.length
    ? satisfies[0]
    : findNext(sorted, range)
  if (!_max) {
    return null
  }

  const patch = semver.maxSatisfying(versions, `~${_min}`)
  const minor = semver.maxSatisfying(versions, `^${_max}`)
  const major = latest && semver.gt(latest, _max)
    ? semver.maxSatisfying(versions, `<=${latest} >=${_max}`)
    : semver.maxSatisfying(versions, `>=${_max}`)

  const latestStable = findLatestStable(sorted)
  latest = latest || (semver.satisfies(max, _range) ? max : latestStable)

  log('%j', {
    wildcard,
    max,
    latest,
    major,
    minor,
    patch
  })
  return {
    wildcard,
    max,
    latest,
    major,
    minor,
    patch
  }
}

module.exports = {
  maxSatisfying
}
