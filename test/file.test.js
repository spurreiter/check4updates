const assert = require('assert')
const { test, versions, range } = require('../src/resolvers/file')

const log = require('debug')('test:file')

describe('#file', function () {
  describe('test', function () {
    ;[
      ['file:test-debug-2.1.0.tgz', true],
      ['file:debug/debug-1.0.0.tgz', true],
      ['file:debug/debug-1.0.0.zip', false]
    ].forEach(([range, exp]) => {
      it(range, function () {
        assert.strictEqual(test(range), exp)
      })
    })
  })

  describe('versions', function () {
    const dirname = `${__dirname}/fixtures/file`
    it('shall get versions from file', function () {
      return versions('mydebug', 'file:debug/mydebug-1.0.0.tgz', { dirname })
        .then(({ versions }) => {
          log(versions)
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.deepStrictEqual(versions, [ '1.0.0', '1.1.0-4', '1.1.0-rc.3', '1.1.0-rc' ])
        })
    })
    it('shall get scoped versions from file', function () {
      return versions('@test/debug', 'file:test-debug-2.1.0.tgz', { dirname })
        .then(({ versions }) => {
          log(versions)
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.deepStrictEqual(versions, [ '2.1.0' ])
        })
    })
    it('shall return an error if module not found', function () {
      return versions('@spurreiter/not-there', 'file:not-there/spurreiter-not-there-1.0.0.tgz', { dirname })
        .then(res => {
          log('%s', res.error)
          assert.ok(/ENOENT: no such file or directory/.test(res.error.message), 'ENOENT: no such file or directory')
        })
    })
  })

  describe('range', function () {
    it('shall return final selected range', function () {
      const versionO = {
        package: 'debug',
        range: '^3.0.0',
        _range: 'file:debug/debug-1.0.0.tgz',
        versions: [],
        type: '^',
        max: '4.0.0',
        major: '4.0.0',
        minor: '3.1.0',
        patch: '3.0.0'
      }
      const res = range(versionO, 'minor')
      assert.strictEqual(res, 'file:debug/debug-3.1.0.tgz')
    })
    it('shall return initial range', function () {
      const versionO = {
        package: 'debug',
        range: '^1.0.0',
        _range: 'file:debug/debug-1.0.0.tgz',
        versions: [],
        type: '^',
        max: '4.0.0',
        major: '4.0.0',
        minor: '3.1.0',
        patch: undefined
      }
      const res = range(versionO, 'patch')
      assert.strictEqual(res, 'file:debug/debug-1.0.0.tgz')
    })
  })
})
