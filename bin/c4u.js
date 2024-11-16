#!/usr/bin/env node

const { cli, check } = require('..')

const prgName = 'c4u'

const cmd = cli()
if (cmd.version) {
  console.log(cmd.version)
} else if (cmd.help) {
  cli.help(prgName)
} else if (cmd.error) {
  console.error(cmd.error)
  process.exit(1)
} else {
  cmd.cli = true
  check(cmd)
    .then(results => {
      if (cmd.ttyout) console.log(cmd.ttyout(cmd)(results))
    })
    .catch(e => {
      console.error(e.message)
      process.exit(1)
    })
}

