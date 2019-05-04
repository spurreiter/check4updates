#!/usr/bin/env node

const { cli, check } = require('..')

const prg = 'c4u'

const cmd = cli()
if (cmd.version) {
  console.log(cmd.version)
} else if (cmd.help) {
  help()
} else {
  cmd.cli = true
  check(cmd)
    .then(results => {
      if (cmd.ttyout) console.log(cmd.ttyout(cmd)(results))
    })
    .catch(e => console.error(e.message))
}

function help () {
  console.log(`
  ${prg} [options] [package ...]

    --help|-h|-?          this help
    --version             show version
    --quiet|-q            quiet mode; no console.log
    --update|-u           update package.json
    --exclude|-x          exclude packages
    --dir|-d <dirname>    use different dirname instead of cwd
    --major               update by major version
    --minor               update by minor version
    --patch               update by patch version
    --prod                only dependencies
    --dev                 only devDependencies
    --peer                only peerDependencies

    package               package name to include/ exclude

  examples:

    ${prg}
                          show packages to update by max possible version
    ${prg} -u debug
                          update package "debug"
    ${prg} -u -x debug semver
                          update all packages excluding "debug" and "semver"
    ${prg} --minor --dev
                          show minor version updates in devDependencies
  `)
}
