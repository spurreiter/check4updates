# check4updates

[![NPM version](https://badge.fury.io/js/check4updates.svg)](https://www.npmjs.com/package/check4updates/)

> Check and update package dependencies.

Yet another dependency checker / updater...

This one supports:

- public / private npm repository
- local tgz packages
- taged git versions on github/ gitlab/ bitbucket (thank you [uWebSockets.js][])

For other similar tools see:

- `npm outdated`
- [npm-check][]
- [npm-check-updates][]

## cli

```
c4u [options] [package ...]

  --help|-h|-?          this help
  --version             show version
  --quiet|-q            quiet mode; no console.log
  --update|-u           update package.json
  --exclude|-x          exclude packages
  --filter|-f <regex>   filter packages by regular expression
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

  c4u
                        show packages to update by max possible version
  c4u -u debug npm
                        update package "debug" and "npm"
  c4u -u -x debug semver
                        update all packages excluding "debug" and "semver"
  c4u --minor --dev
                        show minor version updates in devDependencies

supported URLs in dependencies:

  git+ssh://git@github.com:npm/cli#semver:^5.0
  git+https://user@github.com/npm/cli.git#semver:^5.0
  git+ssh://git@github.com:npm/cli.git#semver:1.0.27
  git://github.com/npm/cli.git#semver:~1.0.27
  github:npm/cli#semver:~1.0.27
  https://github.com/npm/cli/archive/v1.0.27.tar.gz

  file:test/my-debug-1.0.0.tgz
```

## api

See `src/check.js` for usage.


## license

MIT licensed

[npm-check]: https://npmjs.com/package/npm-check
[npm-check-updates]: https://www.npmjs.com/package/npm-check-updates
[uWebSockets.js]: https://github.com/uNetworking/uWebSockets.js
