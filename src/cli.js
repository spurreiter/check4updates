const { resolve } = require('path')
const { progressBar, ttyout } = require('./ttyout')

const radioVersion = (o, field) => {
  ;['major', 'minor', 'patch'].forEach(field => { o[field] = false })
  o[field] = true
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
        const arg = argv.shift()
        if (!arg || arg[0] === '-') {
          console.error('--dir needs dirname')
          process.exit(1)
        }
        o.dirname = resolve(process.cwd(), arg)
        break
      }
      case '--major': {
        radioVersion(o, 'major')
        break
      }
      case '--minor': {
        radioVersion(o, 'minor')
        break
      }
      case '--patch': {
        radioVersion(o, 'patch')
        break
      }
      case '--peer': {
        o.peer = true
        break
      }
      case '--dev': {
        o.dev = true
        break
      }
      case '--prod': {
        o.prod = true
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
      default: {
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
