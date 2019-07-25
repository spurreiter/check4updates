const assert = require('assert')
const {
  PckgJson
} = require('../src/PckgJson')

const log = () => {} // console.log

describe('#PckgJson', function () {
  it('shall read all dependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read().then(packages => {
      log(packages)
      assert.deepStrictEqual(packages, {
        debug: '^3.0.0',
        chalk: '2.1.x',
        'lodash.get': '^3.6.9',
        pacote: '^2.1.2',
        semver: '^5.0',
        mocha: '^5',
        superagent: '^3.0.0',
        mydebug: 'file:../file/debug/mydebug-1.1.0-4.tgz',
        'hosted-git-info': 'github:npm/hosted-git-info#semver:^2.1.0'
      })
    })
  })
  it('shall read only dependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ prod: true }).then(packages => {
      log(packages)
      assert.deepStrictEqual(packages, {
        debug: '^3.0.0',
        chalk: '2.1.x',
        'lodash.get': '^3.6.9',
        pacote: '^2.1.2',
        semver: '^5.0',
        'hosted-git-info': 'github:npm/hosted-git-info#semver:^2.1.0'
      })
    })
  })
  it('shall read only devDependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ dev: true }).then(packages => {
      log(packages)
      assert.deepStrictEqual(packages, {
        mocha: '^5',
        mydebug: 'file:../file/debug/mydebug-1.1.0-4.tgz'
      })
    })
  })
  it('shall read only peerDependencies', function () {
    const pckg = new PckgJson({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read({ peer: true }).then(packages => {
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
    return pckg.read({ dep: true })
      .then(packages => {
        packages.chalk = newChalkVersion
        pckg._merge(pckg.content, packages)
        assert.strictEqual(pckg.content.dependencies.chalk, newChalkVersion)
      })
  })
})
