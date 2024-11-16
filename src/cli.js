const { resolve } = require('path')
const { progressBar, ttyout } = require('./ttyout.js')

const radioVersion = (o, field) => {
  ;['max', 'latest', 'major', 'minor', 'patch'].forEach((field) => {
    o[field] = false
  })
  o[field] = true
}

const startsWithDash = (str) => str && str[0] === '-'

const error = (o, msg) => {
  o.error = msg
  return o
}

function help(prgName) {
  console.log(`
  ${prgName} [options] [package ...]

    --help|-h|-?          this help
    --version             show version
    --quiet|-q            quiet mode; no console.log
    --update|-u           update package.json
    --exclude|-x          exclude packages
    --filter|-f <regex>   filter packages by regular expression
    --Filter|-F <regex>   inverse filter packages by regular expression
    --dir|-d <dirname>    use different dirname instead of cwd
    --max                 update by max version
    --latest              update by latest version (default)
    --major               update by major version
    --minor               update by minor version
    --patch               update by patch version
    --prod                only dependencies
    --dev                 only devDependencies
    --peer                only peerDependencies
    --info                print package name & version (handy for monorepos) 

    package               package name to include/ exclude

  examples:

    ${prgName}
                          show packages to update by max possible version
    ${prgName} -u debug npm
                          update package "debug" and "npm"
    ${prgName} -u -x debug semver
                          update all packages excluding "debug" and "semver"
    ${prgName} --minor --dev
                          show minor version updates in devDependencies

  supported URLs in dependencies:

    git+ssh://git@github.com:npm/cli#semver:^5.0
    git+https://user@github.com/npm/cli.git#semver:^5.0
    git+ssh://git@github.com:npm/cli.git#semver:1.0.27
    git://github.com/npm/cli.git#semver:~1.0.27
    github:npm/cli#semver:~1.0.27
    https://github.com/npm/cli/archive/v1.0.27.tar.gz

    file:test/my-debug-1.0.0.tgz

  ignore updates in package.json:

    { ...
      "c4uIgnore": {
        "<package-name>": "<allowed-range>[ // optional comment]"
      }
    }

  `)
}

/**
 * @typedef {{
 *  help?: boolean
 *  version?: string
 *  quiet?: boolean
 *  dirname?: string
 *  max?: boolean
 *  latest?: boolean
 *  major?: boolean
 *  minor?: boolean
 *  patch?: boolean
 *  peer?: boolean
 *  dev?: boolean
 *  prod?: boolean
 *  update?: boolean
 *  filter?: RegExp
 *  filterInv?: RegExp
 *  info?: boolean
 *  _packages: string[]|[]
 *  include?: string[]
 *  exclude?: string[]
 *  progressBar?: progressBar
 *  ttyout?: ttyout
 * }} Cli
 */

/**
 * @param {string[]} argv
 * @returns {Cli}
 */
function cli(argv = process.argv.slice(2)) {
  const o = {
    /** @type {string[]} */
    _packages: []
  }

  while (argv.length) {
    const arg = argv.shift()

    switch (arg) {
      case '-?':
      case '-h':
      case '--help': {
        o.help = true
        break
      }
      case '--version': {
        // @ts-expect-error
        o.version = require('../package.json').version
        break
      }
      case '-q':
      case '--quiet': {
        o.quiet = true
        break
      }
      case '-d':
      case '--dir': {
        const arg1 = argv.shift()
        if (!arg1 || startsWithDash(arg1)) {
          return error(o, `option "${arg}" needs dirname`)
        }
        o.dirname = resolve(process.cwd(), arg1)
        break
      }
      case '--max':
      case '--latest':
      case '--major':
      case '--minor':
      case '--patch': {
        radioVersion(o, arg.substring(2))
        break
      }
      case '--peer':
      case '--dev':
      case '--prod': {
        o[arg.substring(2)] = true
        break
      }
      case '-u':
      case '--update': {
        o.update = true
        break
      }
      case '-x':
      case '--exclude': {
        o._exclude = true
        break
      }
      case '-f':
      case '--filter': {
        const arg1 = argv.shift()
        if (!arg1 || startsWithDash(arg1)) {
          return error(o, `option "${arg}" needs filter`)
        }
        o.filter = new RegExp(arg1, 'i')
        break
      }
      case '-F':
      case '--Filter': {
        const arg1 = argv.shift()
        if (!arg1 || startsWithDash(arg1)) {
          return error(o, `option "${arg}" needs filter`)
        }
        o.filterInv = new RegExp(arg1, 'i')
        break
      }
      case '--info': {
        o.info = true
        break
      }
      default: {
        if (startsWithDash(arg)) {
          return error(o, `unknown option "${arg}"`)
        }
        if (arg) o._packages.push(arg)
        break
      }
    }
  }

  if (o._packages.length) {
    if (o._exclude) {
      o.exclude = o._packages
    } else {
      o.include = o._packages
    }
  }

  if (!o.quiet) {
    o.progressBar = progressBar
    o.ttyout = ttyout
  }

  return o
}

cli.help = help

module.exports = {
  cli
}
