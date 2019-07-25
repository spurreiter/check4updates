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
    --max                 update by max version
    --latest              update by latest version (default)
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
    ${prg} -u debug npm
                          update package "debug" and "npm"
    ${prg} -u -x debug semver
                          update all packages excluding "debug" and "semver"
    ${prg} --minor --dev
                          show minor version updates in devDependencies

  supported URLs in dependencies:

    git+ssh://git@github.com:npm/cli#semver:^5.0
    git+https://user@github.com/npm/cli.git#semver:^5.0
    git+ssh://git@github.com:npm/cli.git#semver:1.0.27
    git://github.com/npm/cli.git#semver:~1.0.27
    github:npm/cli#semver:~1.0.27
    https://github.com/npm/cli/archive/v1.0.27.tar.gz

    file:test/my-debug-1.0.0.tgz

  `)
}
