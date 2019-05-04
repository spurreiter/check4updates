const chalk = require('chalk')
const semver = require('semver')
const ProgressBar = require('progress')

const progressBar = (total) => {
  const bar = new ProgressBar('[:bar] :current/:total :percent', { total, width: 20, clear: true })
  bar.render()
  return bar
}

const RE_VERSION = /^[~^]?(\d+)\.(\d+)\.(x|\d+)(.*)$/
const RE_VERSION_X = /^[~^]?(\d+)\.(x)(?:\.(x|\d+)|)?(.*)$/

const parse = version => {
  let simple = RE_VERSION_X.exec(version) || RE_VERSION.exec(version)
  if (simple) {
    simple = simple.map(f => f === 'x' ? '0' : f)
    simple.shift()
  }
  return simple
}

const colorVersion = (version, range, wildcard = '') => {
  let r
  if (!semver.satisfies(version, range)) {
    return chalk.red(wildcard + version)
  } else if ((r = parse(range))) {
    let v = parse(version)
    let i = 0
    for (; i < 3; i++) {
      if (v[i] !== r[i]) break
    }
    return wildcard +
      v.slice(0, i).join('.') +
      (i < 3 ? '.' : '') +
      chalk.green(v.slice(i, 3).join('.')) +
      v[3]
  } else {
    return wildcard + version
  }
}

const byPackageName = (a, b) => a.package.localeCompare(b.package)

const ttyout = ({ update } = {}) => ({ results, type = 'max' }) => {
  const spacer = '  '
  const cr = '\n'
  const max = { pckg: 0, range: 0 }
  const errors = []

  const filtered = results.filter(r => {
    const pass = r.range !== r.wildcard + r[type]
    if (pass) {
      max.pckg = Math.max(max.pckg, r.package.length)
      max.range = Math.max(max.range, r.range.replace(/\s/g, '').length)
      if (r.error) errors.push(r)
    }
    return !r.error && pass
  }).sort(byPackageName)

  if (!filtered.length && !errors.length) {
    return cr + spacer + `All dependencies match the package versions...` + cr
  } else {
    const pckgInfo = !filtered.length ? '' : filtered.map(r => {
      const _pckg = r.package.padEnd(max.pckg)
      const _range = r.range.replace(/\s/g, '').padStart(max.range)
      const _version = (!r.wildcard ? ' ' : '') + colorVersion(r[type], r.range, r.wildcard)
      return spacer + `${_pckg}  ${_range}  \u{2192}  ${_version}`
    }).join(cr) + cr + cr

    const errorInfo = !errors.length
      ? ''
      : errors.sort(byPackageName).map(r => {
        const _pckg = r.package.padEnd(max.pckg)
        return spacer + `${_pckg}  \u{2192}  ${chalk.red('ERROR: ' + r.error.message)}`
      }).join(cr) + cr + cr

    const updateInfo = spacer + (
      update
        ? `Run ${chalk.cyan(`npm i`)}`
        : `Run ${chalk.cyan(`c4u -u`)} to upgrade package.json`
    ) + cr

    return cr + pckgInfo + errorInfo + updateInfo
  }
}

module.exports = {
  progressBar,
  colorVersion,
  ttyout
}
