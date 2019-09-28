const { resolve } = require('path')
const { progressBar, ttyout } = require('./ttyout')

const radioVersion = (o, field) => {
  ;['max', 'latest', 'major', 'minor', 'patch'].forEach(field => { o[field] = false })
  o[field] = true
}

const startsWithDash = (str) => str && str[0] === '-'

const error = (o, msg) => {
  o.error = msg
  return o
}

function cli (argv = process.argv.slice(2)) {
  const o = {
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
      default: {
        if (startsWithDash(arg)) {
          return error(o, `unknown option "${arg}"`)
        }
        o._packages.push(arg)
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

module.exports = {
  cli
}
