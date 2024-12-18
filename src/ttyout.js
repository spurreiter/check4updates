const chalk = require('chalk')
const semver = require('semver')
const ProgressBar = require('progress')

/**
 * @typedef {import('./types.js').Result} Versions
 */

const progressBar = (total) => {
  const bar = new ProgressBar('[:bar] :current/:total :percent', {
    total,
    width: 20,
    renderThrottle: 0,
    clear: true
  })
  bar.render()
  return bar
}

const RE_VERSION = /^[~^]?(\d+)\.(\d+)\.(x|\d+)(.*)$/
const RE_VERSION_X = /^[~^]?(\d+)\.(x)(?:\.(x|\d+)|)?(.*)$/

/**
 * @param {string} version
 * @returns {string[]|undefined}
 */
const parse = (version) => {
  let simple = RE_VERSION_X.exec(version) || RE_VERSION.exec(version)
  if (!simple) return

  let _simple = simple.map((f) => (f === 'x' ? '0' : f))
  _simple.shift()

  return _simple
}

const colorVersion = (version, range, wildcard = '', ignore) => {
  let r
  if (ignore) {
    return chalk.gray(wildcard + version + ' (ignored)')
  }
  if (!semver.satisfies(version, range)) {
    return chalk.red(wildcard + version)
  }
  if ((r = parse(range))) {
    const v = parse(version) ?? []
    let i = 0
    for (; i < 3; i++) {
      if (v[i] !== r[i]) break
    }
    const color = i === 1 ? 'cyan' : 'green'
    return (
      wildcard +
      v.slice(0, i).join('.') +
      (i < 3 ? '.' : '') +
      chalk[color](v.slice(i, 3).join('.')) +
      v[3]
    )
  }

  return wildcard + version
}

const byPackageName = (a, b) => a.package.localeCompare(b.package)

/**
 * @param {{update?: boolean, info?: boolean}} param0
 * @returns {(param0: { results: Versions[], type?: string, name: string, version: string }) => string}
 */
const ttyout =
  ({ update, info } = {}) =>
  ({ results, type = 'max', name, version }) => {
    const spacer = '  '
    const cr = '\n'
    const max = { pckg: 0, range: 0 }
    const errors = []

    const printDirInfo = info ? spacer + `${name}@${version}` + cr + cr : ''

    const filtered = results
      .filter((r) => {
        const version = r[type]
        if (!version) return false
        const pass = r.range !== r.wildcard + r[type]
        if (pass) {
          max.pckg = Math.max(max.pckg, r.package.length)
          max.range = Math.max(max.range, r.range.replace(/\s/g, '').length)
          if (r.error) errors.push(r)
        }
        return !r.error && pass
      })
      .sort(byPackageName)

    if (!filtered.length && !errors.length) {
      return (
        cr +
        printDirInfo +
        spacer +
        'All dependencies match the package versions...' +
        cr
      )
    } else {
      let needsUpdateCnt = 0
      const pckgInfo = !filtered.length
        ? ''
        : filtered
            .map((r) => {
              if (!r.ignore) needsUpdateCnt++
              const _pckg = r.package.padEnd(max.pckg)
              const _range = r.range.replace(/\s/g, '').padStart(max.range)
              const _version =
                (!r.wildcard ? ' ' : '') +
                colorVersion(r[type], r.range, r.wildcard, r.ignore)
              return spacer + `${_pckg}  ${_range}  \u{2192}  ${_version}`
            })
            .join(cr) +
          cr +
          cr

      const errorInfo = !errors.length
        ? ''
        : errors
            .sort(byPackageName)
            .map((r) => {
              const _pckg = r.package.padEnd(max.pckg)
              return (
                spacer +
                `${_pckg}  \u{2192}  ${chalk.red('ERROR: ' + r.error.message)}`
              )
            })
            .join(cr) +
          cr +
          cr

      const updateInfo = needsUpdateCnt
        ? spacer +
          (update
            ? `Run ${chalk.cyan('npm i')}`
            : `Run ${chalk.cyan('c4u -u')} to upgrade package.json`) +
          cr
        : spacer + 'All dependencies match the desired package versions...' + cr

      return cr + printDirInfo + pckgInfo + errorInfo + updateInfo
    }
  }

module.exports = {
  progressBar,
  colorVersion,
  ttyout
}
