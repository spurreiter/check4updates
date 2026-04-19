import assert from 'node:assert'
import { calcRange } from '../src/check.js'
import { PckgJson } from '../src/PckgJson.js'
import { PnpmWorkspaceYaml } from '../src/PnpmWorkspaceYaml.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('check:calcRange', function () {
  it('handles undefined package-level ignores and applies workspace ignores', function () {
    const pckg = new PckgJson({
      dirname: 'test/fixtures/monorepo-workspace-ignore'
    })
    // no c4uIgnore on package.json
    pckg.content = { name: 'root', version: '1.0.0' }

    const pnpm = new PnpmWorkspaceYaml({
      dirname: 'test/fixtures/monorepo-workspace-ignore'
    })
    pnpm.content = {
      catalog: {
        'pkg-kept': '^1.0.0'
      },
      updateConfig: {
        ignoreDependencies: ['pkg-ignored@^1.0.0']
      }
    }

    const results = [
      {
        package: 'pkg-ignored',
        latest: '2.0.0',
        versions: ['2.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      },
      {
        package: 'pkg-kept',
        latest: '1.0.0',
        versions: ['1.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      }
    ]

    const { results: after, packages } = calcRange({
      pckg,
      pnpmWorkspace: pnpm,
      patch: false,
      minor: false,
      major: false,
      max: false
    })(results)

    const ignoredEntry = after.find((r) => r.package === 'pkg-ignored')
    assert.strictEqual(ignoredEntry.ignore, true)
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-ignored'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-kept'),
      true
    )
  })

  it('excludes packages ignored via package.json c4uIgnore', function () {
    const pckg = new PckgJson({ dirname: 'test/fixtures/package-json-ignore' })
    pckg.content = {
      name: 'pkg-root',
      version: '1.0.0',
      c4uIgnore: {
        'pkg-ignored': '^1.0.0'
      }
    }

    const results = [
      {
        package: 'pkg-ignored',
        latest: '2.0.0',
        versions: ['2.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      },
      {
        package: 'pkg-kept',
        latest: '1.0.0',
        versions: ['1.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      }
    ]

    const { results: after, packages } = calcRange({
      pckg,
      pnpmWorkspace: null,
      patch: false,
      minor: false,
      major: false,
      max: false
    })(results)

    const ignoredEntry = after.find((r) => r.package === 'pkg-ignored')
    assert.strictEqual(ignoredEntry.ignore, true)
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-ignored'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-kept'),
      true
    )
  })

  it('excludes packages ignored via pnpm-workspace.yaml updateConfig.ignoreDependencies', function () {
    const pckg = new PckgJson({
      dirname: 'test/fixtures/monorepo-workspace-ignore'
    })
    pckg.content = { name: 'root', version: '1.0.0', c4uIgnore: {} }

    const pnpm = new PnpmWorkspaceYaml({
      dirname: 'test/fixtures/monorepo-workspace-ignore'
    })
    pnpm.content = {
      catalog: {
        'pkg-kept': '^1.0.0'
      },
      updateConfig: {
        ignoreDependencies: ['pkg-ignored@^1.0.0']
      }
    }

    const results = [
      {
        package: 'pkg-ignored',
        latest: '2.0.0',
        versions: ['2.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      },
      {
        package: 'pkg-kept',
        latest: '1.0.0',
        versions: ['1.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      }
    ]

    const { results: after, packages } = calcRange({
      pckg,
      pnpmWorkspace: pnpm,
      patch: false,
      minor: false,
      major: false,
      max: false
    })(results)

    const ignoredEntry = after.find((r) => r.package === 'pkg-ignored')
    assert.strictEqual(ignoredEntry.ignore, true)
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-ignored'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-kept'),
      true
    )
  })

  it('applies both workspace and package-level ignores (either rules exclude package)', function () {
    const pckg = new PckgJson({ dirname: 'test/fixtures/mixed-ignore' })
    pckg.content = {
      name: 'root',
      version: '1.0.0',
      c4uIgnore: {
        'pkg-a': '^1.0.0'
      }
    }

    const pnpm = new PnpmWorkspaceYaml({
      dirname: 'test/fixtures/mixed-ignore'
    })
    pnpm.content = {
      catalog: {},
      c4uIgnore: {
        'pkg-b': '^1.0.0'
      }
    }

    const results = [
      {
        package: 'pkg-a',
        latest: '2.0.0',
        versions: ['2.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      },
      {
        package: 'pkg-b',
        latest: '2.0.0',
        versions: ['2.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      },
      {
        package: 'pkg-c',
        latest: '1.0.0',
        versions: ['1.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      }
    ]

    const { results: after, packages } = calcRange({
      pckg,
      pnpmWorkspace: pnpm,
      patch: false,
      minor: false,
      major: false,
      max: false
    })(results)

    const a = after.find((r) => r.package === 'pkg-a')
    const b = after.find((r) => r.package === 'pkg-b')
    const c = after.find((r) => r.package === 'pkg-c')

    assert.strictEqual(a.ignore, true)
    assert.strictEqual(b.ignore, true)
    assert.strictEqual(c.ignore, undefined)

    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-a'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-b'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'pkg-c'),
      true
    )
  })

  it('ignores scoped wildcard patterns from pnpm-workspace.yaml', function () {
    const pckg = new PckgJson({ dirname: 'test/fixtures/mixed-ignore' })
    pckg.content = { name: 'root', version: '1.0.0', c4uIgnore: {} }

    const pnpm = new PnpmWorkspaceYaml({
      dirname: 'test/fixtures/mixed-ignore'
    })
    pnpm.content = {
      catalog: {},
      updateConfig: {
        ignoreDependencies: ['@babel/*@^7']
      }
    }

    const results = [
      {
        package: '@babel/core',
        latest: '8.0.0',
        versions: ['8.0.0'],
        range: '^7.0.0',
        mode: 'npm'
      },
      {
        package: 'other',
        latest: '1.0.0',
        versions: ['1.0.0'],
        range: '^1.0.0',
        mode: 'npm'
      }
    ]

    const { results: after, packages } = calcRange({
      pckg,
      pnpmWorkspace: pnpm,
      patch: false,
      minor: false,
      major: false,
      max: false
    })(results)

    const ignoredEntry = after.find((r) => r.package === '@babel/core')
    assert.strictEqual(ignoredEntry.ignore, true)
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, '@babel/core'),
      false
    )
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(packages, 'other'),
      true
    )
  })
})
