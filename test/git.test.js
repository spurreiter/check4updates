const assert = require('assert')
const { hostedUrl, test, versions, range, getSemver } = require('../src/resolvers/git')

const log = require('debug')('test:git')

describe('#git', function () {
  const ranges = [
    ['git@github.com:npm/hosted-git-info.git#v1.0.0',
      true,
      'git+ssh://git@github.com/npm/hosted-git-info.git'],
    ['git@github.com:npm/hosted-git-info.git#semver:~1.0.0',
      true,
      'git+ssh://git@github.com/npm/hosted-git-info.git'],
    ['github:npm/hosted-git-info',
      true,
      'https://github.com/npm/hosted-git-info.git'],
    ['git+https://github.com/npm/hosted-git-info.git#semver:^1.0.0',
      true,
      'https://github.com/npm/hosted-git-info.git'],
    ['git+https://github.com/npm/hosted-git-info.git',
      true,
      'https://github.com/npm/hosted-git-info.git'],
    ['git+ssh://git@github.com/npm/hosted-git-info.git',
      true,
      'git+ssh://git@github.com/npm/hosted-git-info.git'],
    ['git@github.com:npm/hosted-git-info.git',
      true,
      'git+ssh://git@github.com/npm/hosted-git-info.git'],
    ['https://github.com/npm/hosted-git-info/archive/v1.2.0.tar.gz',
      false,
      undefined]
  ]

  describe('hostedUrl', function () {
    ranges.forEach(([range, exp, url]) => {
      it(range, function () {
        assert.strictEqual(hostedUrl(range), url)
      })
    })
  })

  describe('test', function () {
    ranges.forEach(([range, exp]) => {
      it(range, function () {
        assert.strictEqual(test(range), exp)
      })
    })
  })

  describe('getSemver', function () {
    const tests = [
      ['1.0.0-1^{}', '1.0.0-1'],
      ['0.1.0-beta1^{}', '0.1.0-beta1'],
      ['0.1.0-rc.1-01^{}', '0.1.0-rc.1-01']
    ]
    tests.forEach(([tag, exp]) => {
      it(`shall extract semver from ${tag}`, function () {
        assert.strictEqual(getSemver(tag), exp)
      })
    })
  })

  describe('versions', function () {
    it('shall get versions from remote git', function () {
      return versions('hosted-git-info', 'github:npm/hosted-git-info#v1.2.0')
        .then(({ versions }) => {
          log(versions)
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.ok(versions.includes('1.1.0'), 'shall include v1.1.0')
          assert.ok(versions.includes('2.7.0'), 'shall include v2.7.0')
        })
    })
    it('shall get semver versions from remote git', function () {
      return versions('hosted-git-info', 'github:npm/hosted-git-info#semver:~1.5.1')
        .then(({ versions, range }) => {
          log(versions, range)
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.ok(versions.includes('1.1.0'), 'shall include v1.1.0')
          assert.ok(versions.includes('2.7.0'), 'shall include v2.7.0')
          assert.strictEqual(range, '~1.5.1')
        })
    })
    it('shall get semver versions from remote git using short semver', function () {
      return versions('hosted-git-info', 'github:npm/hosted-git-info#semver:^1')
        .then(({ versions, range }) => {
          log(versions, range)
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.ok(versions.includes('1.1.0'), 'shall include v1.1.0')
          assert.ok(versions.includes('2.7.0'), 'shall include v2.7.0')
          assert.strictEqual(range, '^1')
        })
    })
    it('shall return an error if module not found', function () {
      return versions('hosted-git-info', 'github:test/test/test')
        .then(res => {
          log('%s', res.error)
          assert.ok(/fatal: unable to access|fatal: repository/.test(res.error), 'fatal: unable to access')
        })
    })
    it('shall not get semver from package name', function () {
      return versions('next-i18next', 'https://github.com/isaachinman/next-i18next#semver:^2.1')
        .then(({ versions, _range, range }) => {
          assert.ok(Array.isArray(versions), 'shall be an Array')
          assert.ok(versions.includes('1.1.0'), 'shall include v1.1.0')
          assert.ok(versions.includes('2.1.0'), 'shall include v2.1.0')
          assert.strictEqual(range, '^2.1')
        })
    })
  })

  describe('range', function () {
    it('shall return final selected range', function () {
      const versionO = {
        package: 'hosted-git-info',
        range: '^1.2.0',
        _range: 'github:npm/hosted-git-info#v1.2.0',
        versions: [],
        type: '^',
        max: '2.7.0',
        major: '1.5.3',
        minor: '1.2.0',
        patch: '1.2.0'
      }
      const res = range(versionO, 'major')
      assert.strictEqual(res, 'github:npm/hosted-git-info#v1.5.3')
    })

    it('shall return semver range', function () {
      const versionO = {
        package: 'hosted-git-info',
        range: '^1.2.0',
        _range: 'github:npm/hosted-git-info#semver:~1.2.0',
        versions: [],
        type: '^',
        max: '2.7.0',
        major: '1.5.3',
        minor: '1.2.0',
        patch: '1.2.0'
      }
      const res = range(versionO, 'major')
      assert.strictEqual(res, 'github:npm/hosted-git-info#semver:~1.5.3')
    })

    it('shall use original range', function () {
      const versionO = {
        package: 'hosted-git-info',
        range: '^1.2.0',
        _range: 'github:npm/hosted-git-info#v1.2.0',
        versions: [],
        type: '^',
        max: '2.7.0'
      }
      const res = range(versionO, 'major')
      assert.strictEqual(res, 'github:npm/hosted-git-info#v1.2.0')
    })
  })
})
