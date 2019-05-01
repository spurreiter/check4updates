const assert = require('assert')
const {
  maxSatisfying
} = require('../src/semver')
const versions = require('./fixtures/versions')

const log = require('debug')('test:semver')

describe('#semver', function () {
  describe('maxSatisfying', function () {
    it('any version', function () {
      const res = maxSatisfying(versions, '*')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '6.0.0',
        minor: '6.0.0',
        patch: '6.0.0'
      })
    })
    it('bad version', function () {
      const res = maxSatisfying(versions, 'bad')
      log(res)
      assert.strictEqual(res, null)
    })
    it('fix version', function () {
      const res = maxSatisfying(versions, '2.0.1')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.0.11',
        patch: '2.0.1'
      })
    })
    it('pre version', function () {
      const res = maxSatisfying(versions, '~2.0.0-alpha')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.0.11',
        patch: '2.0.11'
      })
    })
    it('only pre versions', function () {
      const versions = '1.0.0 2.0.0-a 2.0.0-b 2.0.0-0 2.0.0-1'.split(' ')
      const res = maxSatisfying(versions, '~2.0.0-0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '2.0.0-b',
        major: '2.0.0-b',
        minor: '2.0.0-b',
        patch: '2.0.0-b'
      })
    })
    it('minor', function () {
      const res = maxSatisfying(versions, '~2.1.0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.1.0',
        patch: '2.1.0'
      })
    })
    it('minor using .x', function () {
      const res = maxSatisfying(versions, '2.1.x')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.1.0',
        patch: '2.1.0'
      })
    })
    it('major', function () {
      const res = maxSatisfying(versions, '^2.1.0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.3.2',
        patch: '2.3.2'
      })
    })
    it('major using .x.x', function () {
      const res = maxSatisfying(versions, '2.x.x')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.3.2',
        patch: '2.3.2'
      })
    })
    it('major using .x', function () {
      const res = maxSatisfying(versions, '2.x')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.3.2',
        patch: '2.3.2'
      })
    })
    it('greater', function () {
      const res = maxSatisfying(versions, '>=2.0.0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '6.0.0',
        minor: '6.0.0',
        patch: '6.0.0'
      })
    })
    it('lesser', function () {
      const res = maxSatisfying(versions, '<=2.2.3')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.2.1',
        patch: '2.2.1'
      })
    })
    it('wrong min-max', function () {
      const res = maxSatisfying(versions, '<=1.2.3 >2.3.4')
      log(res)
      assert.deepStrictEqual(res, null)
    })
    it('min-max', function () {
      const res = maxSatisfying(versions, '>=1.2.3 <2.3.4')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.3.2',
        patch: '2.3.2'
      })
    })
    it('max-min', function () {
      const res = maxSatisfying(versions, '<=2.3.4 >1.2.3')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '2.3.2',
        minor: '2.3.2',
        patch: '2.3.2'
      })
    })
    it('max-min-alt', function () {
      const res = maxSatisfying(versions, '>3.4.5 <4.2.0 || >=1.2.3 <2.0.4')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '6.0.0',
        major: '4.3.6',
        minor: '4.1.1',
        patch: '4.1.1'
      })
    })
    it('version not available - select next version', function () {
      const res = maxSatisfying(versions, '~2.5.0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '6.0.0',
        major: '3.0.1',
        minor: '3.0.1',
        patch: '3.0.0'
      })
    })
    it('version not available - out of bounds', function () {
      const res = maxSatisfying(versions, '~7.5.0')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '~',
        max: '6.0.0',
        major: '6.0.0',
        minor: '6.0.0',
        patch: '6.0.0'
      })
    })
    it('shall select next possible version if outside range', function () {
      const versions = [
        '4.4.2', '4.4.1',
        '4.4.0', '4.3.0',
        '4.2.1', '4.2.0',
        '4.1.2', '4.1.1',
        '4.1.0', '4.0.2',
        '4.0.1', '4.0.0',
        '3.7.0'
      ]
      const res = maxSatisfying(versions, '^2.4.2')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '4.4.2',
        major: '3.7.0',
        minor: '3.7.0',
        patch: '3.7.0'
      })
    })
    it('shall select max version if version not found', function () {
      const versions = [
        '4.4.2', '4.4.1',
        '4.4.0', '4.3.0',
        '4.2.1', '4.2.0',
        '4.1.2', '4.1.1',
        '4.1.0', '4.0.2',
        '4.0.1', '4.0.0',
        '3.7.0'
      ]
      const res = maxSatisfying(versions, '^5.0.2')
      log(res)
      assert.deepStrictEqual(res, {
        wildcard: '^',
        max: '4.4.2',
        major: '4.4.2',
        minor: '4.4.2',
        patch: '4.4.2'
      })
    })
  })
})
