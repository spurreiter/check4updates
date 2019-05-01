# check4updates

> Check and update package dependencies.

Yet another dependency checker / updater...

This one supports:

- public npm repository
- local tgz packages
- taged git versions on github/ gitlab/ bitbucket (thank you [uWebSockets.js][])

For other similar tools see:

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
  --dir|-d <dirname>    use different dirname instead of cwd
  --major               update by major version
  --minor               update by minor version
  --patch               update by patch version
  --dep                 only dependencies
  --dev                 only devDependencies
  --peer                only peerDependencies

  package               package name to include/ exclude

examples:

  c4u
                        show packages to update by max possible version
  c4u -u debug
                        update package "debug"
  c4u -u -x debug semver
                        update all packages excluding "debug" and "semver"
  c4u --minor --dev
                        show minor version updates in devDependencies
```

## api

See `src/check.js` for


## license

MIT licensed

[npm-check]: https://npmjs.com/package/npm-check
[npm-check-updates]: https://www.npmjs.com/package/npm-check-updates
[uWebSockets.js]: https://github.com/uNetworking/uWebSockets.js
