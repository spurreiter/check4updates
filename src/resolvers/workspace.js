const log = require('debug')('check4updates:resolvers:workspace')

/** @typedef {import('../types.js').Result} Result */

const mode = 'workspace'

/**
 * test for file resolver
 * @param {string} range
 */
const test = (range) => {
  return range.startsWith('workspace:')
}

/**
 * get versions by range
 * 
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `workspace:`
 * @returns {Promise<Result>}
 */
const versions = async (pckg, range) => {
  if (!test(range))
    return Promise.reject(new Error(`${pckg}: no workspace range provided `))

  const _range = range // store org value
  const versions = [range]
  log('%j', { pckg, versions })

  return {
    mode,
    package: pckg,
    _range,
    range,
    versions
  }
}

/**
 * return selected range
 * @param {object} versionO
 * @param {string} _type
 * @returns {string}
 */
const range = (versionO, _type) => {
  return versionO._range
}

module.exports = {
  test,
  versions,
  range
}
