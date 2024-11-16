/** @typedef {import('../types.js').Packages} Packages */
/** @typedef {import('../types.js').NpmOptions} NpmOptions */
/** @typedef {import('../types.js').Result} Result */

const {
  test: fileTest,
  versions: fileVersions,
  range: fileRange
} = require('./file.js')

const {
  test: gitTest,
  versions: gitVersions,
  range: gitRange
} = require('./git.js')

const {
  prepare: npmPrepare,
  versions: npmVersions,
  range: npmRange
} = require('./npm.js')

const {
  test: wsTest,
  versions: wsVersions,
  range: wsRange
} = require('./workspace.js')

/**
 * @param {NpmOptions} [npmOpts] 
 * @returns 
 */
const resolverPrepare = (npmOpts = {}) => {
  return npmPrepare().then((_npmOpts) => ({
    npmOpts: Object.assign({}, _npmOpts, npmOpts)
  }))
}

/**
 * @param {string} pckg 
 * @param {string} range 
 * @param {{dirname: string, npmOpts: NpmOptions}} param 
 * @returns {Promise<Result>}
 */
const resolver = (pckg, range, { dirname, npmOpts }) => {
  if (fileTest(range)) {
    return fileVersions(pckg, range, { dirname })
  } else if (gitTest(range)) {
    return gitVersions(pckg, range)
  } else if (wsTest(range)) {
    return wsVersions(pckg, range)
  } else {
    return npmVersions(pckg, range, npmOpts)
  }
}

/**
 * @param {Result[]} foundPckgVersions 
 * @param {string} type 
 * @returns {Record<string,Result>}
 */
const resolverRange = (foundPckgVersions, type) => {
  const packages = foundPckgVersions.reduce((o, versionO) => {
    if (!versionO.error && !versionO.ignore) {
      const { package: pckg, mode } = versionO
      let final
      switch (mode) {
        case 'file':
          final = fileRange(versionO, type)
          break
        case 'git':
          final = gitRange(versionO, type)
          break
        case 'workspace':
          final = wsRange(versionO, type)
          break
        default:
          final = npmRange(versionO, type)
      }
      versionO.final = o[pckg] = final
    }
    return o
  }, {})
  return packages
}

module.exports = {
  resolverPrepare,
  resolver,
  resolverRange
}
