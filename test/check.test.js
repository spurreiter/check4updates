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
          final: '^3.2.6',
          patch: '3.2.6',
          package: 'debug'
        }, {
          final: 'github:npm/hosted-git-info#2.7.1',
          patch: '2.7.1',
          package: 'hosted-git-info'
        }, {
          final: '^3.7.0',
          patch: '3.7.0',
          package: 'lodash.get'
        }, {
          final: '^5.2.0',
          patch: '5.2.0',
          package: 'mocha'
        }, {
          final: 'file:../file/debug/mydebug-1.0.0.tgz',
          patch: '1.0.0',
          package: 'mydebug'
        }, {
          final: '^2.0.0',
          patch: '2.0.0',
          package: 'pacote'
        }, {
          final: '^5.7.0',
          patch: '5.7.0',
          package: 'semver'
        }, {
          final: '^3.8.3',
          patch: '3.8.3',
          package: 'superagent'
        } ])
    })
  })
})
