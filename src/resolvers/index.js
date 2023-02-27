/**
 * @typedef {Object} Versions
 * @property {Object} versions
 */

const {
  test: fileTest,
  versions: fileVersions,
  range: fileRange
} = require('./file')

const {
  test: gitTest,
  versions: gitVersions,
  range: gitRange
} = require('./git')

const {
  prepare: npmPrepare,
  versions: npmVersions,
  range: npmRange
} = require('./npm')

const resolverPrepare = (npmOpts = {}) => {
  return npmPrepare()
    .then(_npmOpts => ({ npmOpts: Object.assign({}, _npmOpts, npmOpts) }))
}

const resolver = (pckg, range, { dirname, npmOpts }) => {
  if (fileTest(range)) {
    return fileVersions(pckg, range, { dirname })
  } else if (gitTest(range)) {
    return gitVersions(pckg, range)
  } else {
    return npmVersions(pckg, range, npmOpts)
  }
}

const resolverRange = (aVersionsO, type) => {
  const packages = aVersionsO.reduce((o, versionO) => {
    if (!versionO.error) {
      const { package: pckg, mode } = versionO
      let final
      switch (mode) {
        case 'file':
          final = fileRange(versionO, type)
          break
        case 'git':
          final = gitRange(versionO, type)
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
