const assert = require('assert')
const { PckgJson } = require('../src/PckgJson.js')

const log = () => {} // console.log

describe('#PckgJson', function () {
  it('shall read all dependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read().then((packages) => {
      log(packages)
      assert.deepStrictEqual(packages, {
        debug: '^3.0.0',
        chalk: '2.1.x',
        'lodash.get': '^3.6.9',
        handlebars: '^3.0.1',
        pacote: '^2.1.2',
        semver: '^5.0',
        shelljs: '~0.8.5',
        mocha: '^5',
        superagent: '^3.0.0',
        mydebug: 'file:../file/debug/mydebug-1.1.0-4.tgz',
        'hosted-git-info': 'github:npm/hosted-git-info#semver:^2.1.0',
        '@my/package': 'workspace:*',
        '@my/pnpm-workspace.yaml': 'catalog:'
      })
    })
  })

  it('shall read only dependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ prod: true }).then((packages) => {
      log(packages)
      assert.deepStrictEqual(packages, {
        debug: '^3.0.0',
        chalk: '2.1.x',
        handlebars: '^3.0.1',
        'lodash.get': '^3.6.9',
        pacote: '^2.1.2',
        semver: '^5.0',
        'hosted-git-info': 'github:npm/hosted-git-info#semver:^2.1.0',
        '@my/package': 'workspace:*',
        '@my/pnpm-workspace.yaml': 'catalog:'
      })
    })
  })

  it('shall read only devDependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ dev: true }).then((packages) => {
      log(packages)
      assert.deepStrictEqual(packages, {
        mocha: '^5',
        mydebug: 'file:../file/debug/mydebug-1.1.0-4.tgz',
        shelljs: '~0.8.5'
      })
    })
  })

  it('shall read only peerDependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ peer: true }).then((packages) => {
      log(packages)
      assert.deepStrictEqual(packages, {
        'hosted-git-info': 'github:npm/hosted-git-info#v2.1.0',
        superagent: '^3.0.0'
      })
    })
  })

  it('shall merge dependencies', function () {
    const newChalkVersion = '2.2.0-updated'

    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ dep: true }).then((packages) => {
      packages.chalk = newChalkVersion
      pckg._merge(pckg.content, packages)
      assert.strictEqual(pckg.content.dependencies.chalk, newChalkVersion)
    })
  })

  it('shall get ignored packages with their range', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    pckg.content = {
      c4uIgnore: {
        chalk: '^4 ',
        spaces: '   ^3  ',
        comment: '17.x // with a comment'
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      chalk: '^4',
      comment: '17.x',
      spaces: '^3'
    })
  })

  it('shall throw if ignored packages does not contain a valid range', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    pckg.content = {
      c4uIgnore: {
        throws: 'not a valid range'
      }
    }
    assert.throws(
      () => {
        pckg.getIgnored()
      },
      (err) => {
        return (
          err.message ===
          'c4uIgnore: package "throws" does not contain a valid range "not a valid range"'
        )
      }
    )
  })
})
