const assert = require('assert')
const {
  cp,
  mkdir,
  test
} = require('shelljs')
const {
  check
} = require('..')

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

      const patchV = results.map(r => ({
        patch: r.patch,
        package: r.package,
        final: r.final
      })).sort((a, b) => a.package.localeCompare(b.package))

      log(patchV)

      assert.deepStrictEqual(patchV, [
        {
          final: '~2.1.0',
          patch: '2.1.0',
          package: 'chalk'
        }, {
          final: '^3.0.1',
          patch: '3.0.1',
          package: 'debug'
        }, {
          final: 'github:npm/hosted-git-info#semver:^2.1.5',
          patch: '2.1.5',
          package: 'hosted-git-info'
        }, {
          final: '^3.7.0',
          patch: '3.7.0',
          package: 'lodash.get'
        }, {
          final: '^5.0.5',
          patch: '5.0.5',
          package: 'mocha'
        }, {
          final: 'file:../file/debug/mydebug-1.1.0-rc.3.tgz',
          patch: '1.1.0-rc.3',
          package: 'mydebug'
        }, {
          final: '^2.1.2',
          patch: '2.1.2',
          package: 'pacote'
        }, {
          final: '^5.0.3',
          patch: '5.0.3',
          package: 'semver'
        }, {
          final: '^3.0.0',
          patch: '3.0.0',
          package: 'superagent'
        }])
    })
  })

  it('shall get minor versions', function () {
    this.timeout(5000)
    return check({
      dirname: `${__dirname}/fixtures/tmp`,
      minor: true
    }).then(({ type, results }) => {
      log(type, results)

      const minorV = results.map(r => ({
        // minor: r.minor,
        package: r.package,
        final: r.final
      })).sort((a, b) => a.package.localeCompare(b.package))

      log(minorV)

      assert.deepStrictEqual(minorV, [
        {
          final: '~2.4.2',
          package: 'chalk'
        }, {
          final: '^3.2.6',
          package: 'debug'
        }, {
          final: 'github:npm/hosted-git-info#semver:^2.8.4',
          package: 'hosted-git-info'
        }, {
          final: '^3.7.0',
          package: 'lodash.get'
        }, {
          final: '^5.2.0',
          package: 'mocha'
        }, {
          final: 'file:../file/debug/mydebug-1.1.0-rc.3.tgz',
          package: 'mydebug'
        }, {
          final: '^2.7.38',
          package: 'pacote'
        }, {
          final: '^5.7.1',
          package: 'semver'
        }, {
          final: '^3.8.3',
          package: 'superagent'
        }])
    })
  })
})
