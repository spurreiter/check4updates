const semver = require('semver')
const log = require('debug')('check4updates:semver')

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

const _sortVersions = (a, b) => {
  if (semver.gt(a, b)) return -1
  if (a === b) return 0
  return 1
}

/**
 * @typedef {Object} FoundVersions
 * @property {string} type - version range char `^`, '~'
 * @property {string} max - max available version
 * @property {string} major - matching major version
 * @property {string} minor - matching minor version
 * @property {string} patch - matching patch version
 */

/**
 * @param {string[]} versions - list of semver versions
 * @param {string} range - semver range
 * @returns {FoundVersions}
 */
const maxSatisfying = (versions = [], range) => {
  const _range = semver.validRange(range)
  log('range %j', _range)
  if (!_range) return null
  const wildcard = rangeWildcard(range)
  const sorted = versions.sort(_sortVersions)
  const max = sorted[0]
  const satisfies = sorted.filter(v => semver.satisfies(v, _range))
  log('satisfies %j', satisfies)
  const patch = satisfies.length
    ? satisfies[0]
    : findNext(sorted, range)
  if (!patch) return null
  const minor = semver.maxSatisfying(versions, '~' + patch)
  const major = semver.maxSatisfying(versions, '^' + patch)
  log('%j', {
    wildcard,
    max,
    major,
    minor,
    patch
  })
  return {
    wildcard,
    max,
    major,
    minor,
    patch
  }
}

module.exports = {
  maxSatisfying
}
