const assert = require('assert')
const { versions, range } = require('../src/resolvers/npm')

const log = require('debug')('test:npm')

describe('#npm', function () {
  describe('versions', function () {
    it('shall get versions from npm', function () {
      return versions('debug').then(({ versions }) => {
        log(versions)
        assert.ok(Array.isArray(versions), 'shall be an Array')
        assert.ok(versions.includes('0.0.1'), 'shall include version 0.0.1')
        assert.ok(versions.includes('3.2.6'), 'shall include version 3.2.6')
      })
    })
    it('shall return an error if module not found', function () {
      this.timeout(10000)
      return versions('@spurreiter/not-there')
        .then(res => {
          log('%s', res.error)
          assert.ok(/404 Not Found - GET/.test(res.error), '404 Not Found - GET ' +
            'https://registry.npmjs.org/@spurreiter%2fnot-there ' +
            '- Not found')
        })
    })
  })

  describe('range', function () {
    it('shall return final selected range', function () {
      const versionO = {
        package: 'semver',
        range: '^3.0.0',
        versions: [],
        wildcard: '^',
        max: '4.0.0',
        major: '4.0.0',
        minor: '3.1.0',
        patch: '3.0.0'
      }
      const res = range(versionO, 'major')
      assert.strictEqual(res, '^4.0.0')
    })
  })
})
