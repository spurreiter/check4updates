const assert = require('assert')
const { PnpmWorkspaceYaml } = require('../src/PnpmWorkspaceYaml.js')

const log = () => {} // console.log

describe('#PnpmWorkspaceYaml', function () {
  it('shall read all dependencies', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read().then((packages) => {
      log(packages)
      assert.deepStrictEqual(packages, {
        c8: '~10.1.3',
        chalk: '2.1.x'
      })
    })
  })

  it('shall merge dependencies', function () {
    const newChalkVersion = '2.2.0-updated'

    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test`
    })
    return pckg.read().then((packages) => {
      packages.chalk = newChalkVersion
      pckg._merge(pckg.content, packages)
      assert.strictEqual(pckg.content.catalog.chalk, newChalkVersion)
    })
  })

  it('shall get ignored packages with their range', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      catalog: {
        chalk: '2.1.x'
      },
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
    const pckg = new PnpmWorkspaceYaml({
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
