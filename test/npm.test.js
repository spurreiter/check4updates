const assert = require('assert')
const { versions, range } = require('../src/resolvers/npm.js')

const log = require('debug')('test:npm')

describe('#npm', function () {
  describe('versions', function () {
    it('shall get versions from npm', function () {
      return versions('debug', '^1.0.1').then(({ versions, ...other }) => {
        log(versions)
        log(other)
        assert.ok(Array.isArray(versions), 'shall be an Array')
        assert.ok(versions.includes('0.0.1'), 'shall include version 0.0.1')
        assert.ok(versions.includes('3.2.6'), 'shall include version 3.2.6')
      })
    })
    it('shall return an error if module not found', function () {
      this.timeout(10000)
      return versions('@spurreiter/not-there').then((res) => {
        log('%s', res.error)
        assert.ok(
          /404 Not Found - GET/.test(res.error),
          '404 Not Found - GET ' +
            'https://registry.npmjs.org/@spurreiter%2fnot-there ' +
            '- Not found'
        )
      })
    })
  })
  describe('versions with minReleaseAge', function () {
    it('shall filter versions by minReleaseAge', function () {
      this.timeout(10000)
      return versions('debug', '^1.0.1', { minReleaseAge: 365 }).then(
        ({ versions, latest }) => {
          log(versions)
          log({ latest })
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.ok(versions.length > 0, 'shall have versions after filtering')
          // Check that filtered versions don't include very recent releases
          assert.ok(latest, 'shall have a latest version')
        }
      )
    })

    it('shall handle empty versions after filtering', function () {
      this.timeout(10000)
      // Use a very high minReleaseAge to filter out all versions
      return versions('debug', '^1.0.1', { minReleaseAge: 10000 }).then(
        ({ versions, latest }) => {
          log(versions)
          log({ latest })
          assert.ok(Array.isArray(versions), 'shall be an Array')
          // All versions should be filtered out with such a high minReleaseAge
          assert.strictEqual(
            versions.length,
            0,
            'should have no versions after extreme filtering'
          )
          assert.strictEqual(
            latest,
            undefined,
            'latest should be undefined when all versions filtered'
          )
        }
      )
    })

    it('shall update latest when original latest is filtered out', function () {
      this.timeout(10000)
      return versions('debug', '^1.0.1', { minReleaseAge: 30 }).then(
        ({ versions, latest }) => {
          log(versions)
          log({ latest })
          assert.ok(Array.isArray(versions), 'shall be an Array')
          if (versions.length > 0) {
            assert.ok(latest, 'shall have a latest version when versions exist')
            assert.ok(
              versions.includes(latest),
              'latest should be in filtered versions'
            )
          }
        }
      )
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
