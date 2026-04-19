import { eachLimit } from 'asyncc-promise'
import semver from 'semver'
import { PckgJson } from './PckgJson.js'
import { PnpmWorkspaceYaml } from './PnpmWorkspaceYaml.js'
import { resolverPrepare, resolver, resolverRange } from './resolvers/index.js'
import { maxSatisfying } from './semver.js'
import { incexc } from './incexc.js'
import debug from 'debug'
const log = debug('check4updates:check')

/** @typedef {import('progress')} ProgressBar */
/** @typedef {import('./types.js').Cli} Cli */
/** @typedef {import('./types.js').Packages} Packages */
/** @typedef {import('./types.js').NpmOptions} NpmOptions */
/** @typedef {import('./types.js').Result} Result */

/**
 * @param {ProgressBar} progressBar
 * @param {string} dirname
 * @param {NpmOptions} npmOpts
 * @returns {(packages: Packages) => Promise<Result[]>}
 */
const queryVersions = (progressBar, dirname, npmOpts) => async (packages) => {
  const { npmOpts: preparedOpts } = await resolverPrepare(npmOpts)
  log(preparedOpts)
  log(packages)
  const total = Object.keys(packages).length
  const progress = total && progressBar && progressBar(total)
  const limit = Math.min(50, total)

  return eachLimit(limit, Object.entries(packages), async ([pckg, range]) => {
    const data = await resolver(pckg, range, { dirname, npmOpts: preparedOpts })
    progress && progress.tick()
    return data
  })
}

/**
 * @private
 * @param {Result[]} results
 * @returns {Result[]} results with added "latest", "max", "patch", "minor", "major" properties
 * and "ignore" flag if applicable
 */
const calcVersions = (results) => {
  return results.map((pckg) => {
    log('package "%s"', pckg.package)
    const res = Object.assign(
      {},
      pckg,
      maxSatisfying(pckg.versions, pckg.range, pckg.latest)
    )
    return res
  })
}

/**
 * @private
 * @param {{ results: Result[], ignored?: Record<string, string>, type: 'patch'|'minor'|'major'|'max'|'latest' }} param0
 * @returns {void}
 */
const setIgnoredFlag = ({ results, ignored, type }) => {
  if (!ignored) {
    return
  }

  const wildcard = {}
  // handle updateConfig.ignoreDependencies with wildcard suffix first
  for (const [ign, range] of Object.entries(ignored)) {
    if (!ign.endsWith('*')) {
      continue
    }
    const prefix = ign.slice(0, -1)
    if (!prefix) {
      continue
    }
    wildcard[prefix] = range
  }

  // handle exact matches
  for (const res of results) {
    let range = ignored[res.package]
    // handle wildcard matches
    if (!range) {
      for (const [prefix, wildcardRange] of Object.entries(wildcard)) {
        if (res.package.startsWith(prefix)) {
          range = wildcardRange
          break
        }
      }
    }
    if (range) {
      const selectedVersion = res[type]
      const satisfies = semver.satisfies(selectedVersion, range)
      if (!satisfies) {
        res.ignore = true
      }
    }
  }
}

const ignorePnpmWorkspaceCatalog = ({ results }) => {
  results.forEach((res) => {
    // ignore pnpm catalog: ranges; edit them in pnpm-workspace.yaml
    if (res.range === 'catalog:') {
      res.ignore = true
    }
  })
}

/**
 * @private
 * @param {{ pckg: PckgJson|PnpmWorkspaceYaml, pnpmWorkspace: PnpmWorkspaceYaml|null, patch?: boolean, minor?: boolean, major?: boolean, max?: boolean }} param0
 * @returns {(results: Result[]) => { results: Result[], packages: Packages, type: 'patch'|'minor'|'major'|'max'|'latest' }}
 */
const calcRange =
  ({ pckg, pnpmWorkspace, patch, minor, major, max }) =>
  (results) => {
    const type = patch
      ? 'patch'
      : minor
        ? 'minor'
        : major
          ? 'major'
          : max
            ? 'max'
            : 'latest'

    // start with package-level ignored map or empty object
    const ignored = pckg.getIgnored() || {}
    if (pnpmWorkspace) {
      const pnpmIgnored = pnpmWorkspace.getIgnored() || {}
      for (let [name, range] of Object.entries(pnpmIgnored)) {
        // workspace entries add to or override package-level entries
        ignored[name] = range
      }
    }
    setIgnoredFlag({ results, ignored, type })
    ignorePnpmWorkspaceCatalog({ results })

    const packages = resolverRange(results, type)
    log('packages', packages)
    return { results, packages, type }
  }

const updatePckg =
  (update, pckg) =>
  async ({ results, packages, type }) => {
    const { name, version } = pckg.content
    if (update) {
      await pckg.write(packages)
    }
    return { results, type, name, version }
  }

/**
 * @param {Cli} [param0]
 * @returns {Promise} `{ results: object, type: string }`
 */
async function check(param0) {
  const {
    dirname = process.cwd(),
    update,
    include,
    exclude,
    filter,
    filterInv,
    prod,
    dev,
    peer,
    patch,
    minor,
    major,
    // latest,
    max,
    progressBar,
    catalog,
    minReleaseAge
  } = param0 || {}
  const pckg = catalog
    ? new PnpmWorkspaceYaml({ dirname })
    : new PckgJson({ dirname })
  const npmOpts = {} // future use
  // Only include minReleaseAge if explicitly provided via CLI
  if (minReleaseAge !== undefined) {
    npmOpts.minReleaseAge = minReleaseAge
  }

  let pnpmWorkspace = null
  if (!catalog) {
    try {
      pnpmWorkspace = new PnpmWorkspaceYaml({ dirname })
      await pnpmWorkspace.read()
    } catch {
      // no pnpm workspace file found
    }
  }

  const packages = await pckg.read({ prod, dev, peer })
  const filtered = await incexc({
    packages,
    include,
    exclude,
    filter,
    filterInv
  })
  const results = await queryVersions(progressBar, dirname, npmOpts)(filtered)
  const versions = calcVersions(results)
  const ranged = calcRange({ pckg, pnpmWorkspace, patch, minor, major, max })(
    versions
  )
  const updated = await updatePckg(update, pckg)(ranged)
  return updated
}

export { check, calcRange }
