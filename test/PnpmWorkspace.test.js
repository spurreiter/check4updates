import assert from 'node:assert'
import { PnpmWorkspaceYaml } from '../src/PnpmWorkspaceYaml.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

  it('shall parse updateConfig.ignoreDependencies when c4uIgnore is absent (array form)', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      catalog: {
        chalk: '2.1.x'
      },
      updateConfig: {
        ignoreDependencies: ['chalk@^5 ', 'other@  ~1.2.3 // reason']
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      chalk: '^5',
      other: '~1.2.3'
    })
  })

  it('c4uIgnore takes precedence over updateConfig.ignoreDependencies (array form)', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      c4uIgnore: {
        chalk: '^4'
      },
      updateConfig: {
        ignoreDependencies: ['chalk@^1', 'spaces@^3']
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      chalk: '^4',
      spaces: '^3'
    })
  })

  it('shall throw if updateConfig.ignoreDependencies contains invalid range (array form)', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test`
    })
    pckg.content = {
      updateConfig: {
        ignoreDependencies: ['throws@not a valid range']
      }
    }
    assert.throws(
      () => {
        pckg.getIgnored()
      },
      (err) =>
        err.message ===
        'updateConfig.ignoreDependencies: package "throws" does not contain a valid range "not a valid range"'
    )
  })

  it('shall accept array entries without range and default to *', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      updateConfig: {
        ignoreDependencies: ['chalk', '@scope/pkg']
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      chalk: '*',
      '@scope/pkg': '*'
    })
  })

  it('shall parse scoped package with range from array entry', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      updateConfig: {
        ignoreDependencies: ['@babel/core@^5']
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      '@babel/core': '^5'
    })
  })

  it('shall accept pattern entries in array form', function () {
    const pckg = new PnpmWorkspaceYaml({
      dirname: `${__dirname}/fixtures/test/foo`
    })
    pckg.content = {
      updateConfig: {
        ignoreDependencies: ['@babel/*@^7']
      }
    }
    const ignored = pckg.getIgnored()
    assert.deepStrictEqual(ignored, {
      '@babel/*': '^7'
    })
  })
})
