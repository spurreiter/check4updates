const assert = require('assert')
const { cp, mkdir, test } = require('shelljs')
const { check } = require('../src/index.js')

const log = require('debug')('test:check')

describe('check', function () {
  before(function () {
    const target = `${__dirname}/fixtures/tmp`
    !test('-d', target) && mkdir(target)
    cp('-rf', `${__dirname}/fixtures/test/package.json`, target)
  })

  it('shall get patch versions', function () {
    this.timeout(5000)
    return check({
      dirname: `${__dirname}/fixtures/tmp`,
      patch: true
    }).then(({ type, results }) => {
      log(type, results)

      const patchV = results
        .map((r) => ({
          patch: r.patch,
          package: r.package,
          final: r.final,
          ignore: r.ignore
        }))
        .sort((a, b) => a.package.localeCompare(b.package))

      log(patchV)

      assert.deepStrictEqual(patchV, [
        {
          final: 'workspace:*',
          ignore: undefined,
          package: '@my/package',
          patch: undefined
        },
        {
          final: undefined,
          ignore: true,
          package: '@my/pnpm-workspace.yaml',
          patch: undefined
        },
        {
          final: undefined,
          ignore: true,
          package: 'c8',
          patch: undefined
        },
        {
          final: '~2.1.0',
          patch: '2.1.0',
          package: 'chalk',
          ignore: undefined
        },
        {
          final: '^3.0.1',
          patch: '3.0.1',
          package: 'debug',
          ignore: undefined
        },
        {
          final: '^3.0.8',
          package: 'handlebars',
          patch: '3.0.8',
          ignore: undefined // patch version can be updated!
        },
        {
          final: 'github:npm/hosted-git-info#semver:^2.1.5',
          patch: '2.1.5',
          package: 'hosted-git-info',
          ignore: undefined
        },
        {
          final: '^3.7.0',
          patch: '3.7.0',
          package: 'lodash.get',
          ignore: undefined
        },
        {
          final: '^5.0.5',
          patch: '5.0.5',
          package: 'mocha',
          ignore: undefined
        },
        {
          final: 'file:../file/debug/mydebug-1.1.0-rc.3.tgz',
          patch: '1.1.0-rc.3',
          package: 'mydebug',
          ignore: undefined
        },
        {
          final: '^2.1.2',
          patch: '2.1.2',
          package: 'pacote',
          ignore: undefined
        },
        {
          final: '^5.0.3',
          patch: '5.0.3',
          package: 'semver',
          ignore: undefined
        },
        {
          final: undefined,
          package: 'shelljs',
          patch: '0.8.5',
          ignore: true
        },
        {
          final: '^3.0.0',
          patch: '3.0.0',
          package: 'superagent',
          ignore: undefined
        }
      ])
    })
  })

  it('shall get minor versions', function () {
    this.timeout(5000)
    return check({
      dirname: `${__dirname}/fixtures/tmp`,
      minor: true
    }).then(({ type, results }) => {
      log(type, results)

      const minorV = results
        .map((r) => ({
          // minor: r.minor,
          package: r.package,
          final: r.final,
          ignore: r.ignore
        }))
        .sort((a, b) => a.package.localeCompare(b.package))

      log(minorV)

      assert.deepStrictEqual(minorV, [
        {
          final: 'workspace:*',
          ignore: undefined,
          package: '@my/package'
        },
        {
          final: undefined,
          ignore: true,
          package: '@my/pnpm-workspace.yaml'
        },
        { package: 'c8', final: undefined, ignore: true },
        { package: 'chalk', final: '~2.4.2', ignore: undefined },
        { package: 'debug', final: '^3.2.7', ignore: undefined },
        { package: 'handlebars', final: '^3.0.8', ignore: undefined },
        {
          package: 'hosted-git-info',
          final: 'github:npm/hosted-git-info#semver:^2.8.9',
          ignore: undefined
        },
        { package: 'lodash.get', final: '^3.7.0', ignore: undefined },
        { package: 'mocha', final: '^5.2.0', ignore: undefined },
        {
          package: 'mydebug',
          final: 'file:../file/debug/mydebug-1.1.0-rc.3.tgz',
          ignore: undefined
        },
        { package: 'pacote', final: '^2.7.38', ignore: undefined },
        { package: 'semver', final: '^5.7.2', ignore: undefined },
        { package: 'shelljs', final: undefined, ignore: true },
        { package: 'superagent', final: '^3.8.3', ignore: undefined }
      ])
    })
  })

  // needs constant updates!
  it.skip('shall get major versions', function () {
    this.timeout(5000)
    return check({
      dirname: `${__dirname}/fixtures/tmp`,
      major: true
    }).then(({ type, results }) => {
      log(type, results)

      const majorV = results
        .map((r) => ({
          package: r.package,
          final: r.final,
          ignore: r.ignore
        }))
        .sort((a, b) => a.package.localeCompare(b.package))

      console.log(majorV)

      assert.deepStrictEqual(majorV, [
        { package: '@my/package', final: 'workspace:*', ignore: undefined },
        {
          package: '@my/pnpm-workspace.yaml',
          final: undefined,
          ignore: true
        },
        { package: 'c8', final: undefined, ignore: true },
        { package: 'chalk', final: '~5.6.2', ignore: undefined },
        { package: 'debug', final: '^4.4.3', ignore: undefined },
        { package: 'handlebars', final: undefined, ignore: true },
        {
          package: 'hosted-git-info',
          final: 'github:npm/hosted-git-info#semver:^9.0.0',
          ignore: undefined
        },
        { package: 'lodash.get', final: '^4.4.2', ignore: undefined },
        { package: 'mocha', final: '^11.7.2', ignore: undefined },
        {
          package: 'mydebug',
          final: 'file:../file/debug/mydebug-1.1.0-rc.3.tgz',
          ignore: undefined
        },
        { package: 'pacote', final: '^21.0.3', ignore: undefined },
        { package: 'semver', final: '^7.7.2', ignore: undefined },
        { package: 'shelljs', final: undefined, ignore: true },
        { package: 'superagent', final: '^10.2.3', ignore: undefined }
      ])
    })
  })

  it('shall get filtered packages', function () {
    this.timeout(7000)
    return check({
      dirname: `${__dirname}/fixtures/tmp`,
      minor: true,
      filter: /chalk|^debug/i
    }).then(({ type, results }) => {
      log(type, results)

      const minorV = results
        .map((r) => ({
          // minor: r.minor,
          package: r.package,
          final: r.final
        }))
        .sort((a, b) => a.package.localeCompare(b.package))

      log(minorV)

      assert.deepStrictEqual(minorV, [
        {
          final: '~2.4.2',
          package: 'chalk'
        },
        {
          final: '^3.2.7',
          package: 'debug'
        }
      ])
    })
  })
})
