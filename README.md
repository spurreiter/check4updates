# check4updates

[![npm version][npm-version-badge]][npm-version-badge-link]
[![CI][ci-badge]][ci-badge-link]

> Check and update package dependencies.

Yet another dependency checker / updater...

This one supports:

- public / private npm repository
- local tgz packages
- tagged git versions on github/ gitlab/ bitbucket (e.g. [uWebSockets.js][])
- ignore updates using `c4uIgnore` in `package.json`
- `--catalog` option updates pnpm-workspace.yaml catalog entries

For other similar tools see:

- `npm outdated`
- [npm-check][]
- [npm-check-updates][]

## install 

```sh
npm install --global check4updates
```

## ignore updates in package.json

add a `c4uIgnore` field in the `package.json` file, like:

```
{ ...
  "c4uIgnore": {
    "<package-name>": "<allowed-range>[ // optional comment]"
  }
}
```

e.g.
```json
{
  "name": "my-package",
  "dependencies": {
    "chalk": "^4.0.0"
  },
  "c4uIgnore": {
    "chalk": "^4 // do not upgrade; ^5 is ESM only support"
  }
}
```

## cli

```
c4u [options] [package ...]

    -h, --help            this help
        --version         show version
    -q, --quiet           quiet mode; no console.log
    -u, --update          update package.json
    -x, --exclude         exclude packages
    -f, --filter <regex>  filter packages by regular expression
    -F, --Filter <regex>  inverse filter packages by regular expression
    -d, --dir <dirname>   use different dirname instead of cwd
        --max             update by max version
        --latest          update by latest version (default)
        --major           update by major version
        --minor           update by minor version
        --patch           update by patch version
        --prod            only dependencies
        --dev             only devDependencies
        --peer            only peerDependencies
        --info            print package name & version (handy for monorepos)
    -c, --catalog         update pnpm-workspace.yaml "catalog:" entries

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

ignore updates in package.json:

  { ...
    "c4uIgnore": {
      "<package-name>": "<allowed-range>[ // optional comment]"
    }
  }

```

## api

See `src/check.js` for usage.


## license

MIT licensed

[npm-check]: https://npmjs.com/package/npm-check
[npm-check-updates]: https://www.npmjs.com/package/npm-check-updates
[uWebSockets.js]: https://github.com/uNetworking/uWebSockets.js

[npm-version-badge]: https://badge.fury.io/js/check4updates.svg
[npm-version-badge-link]: https://www.npmjs.com/package/check4updates
[ci-badge]: https://github.com/spurreiter/check4updates/actions/workflows/ci.yml/badge.svg?branch=master
[ci-badge-link]: https://github.com/spurreiter/check4updates/actions/workflows/ci.yml
