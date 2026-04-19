import fsp from 'node:fs/promises'
import path from 'node:path'
import semver from 'semver'
import yaml from 'js-yaml'

/**
 * @typedef {{}|Record<string,string>} Packages
 */

const FILENAME = 'pnpm-workspace.yaml'

class PnpmWorkspaceYaml {
  /**
   * @param {{
   *  dirname?: string
   *  basename?: string
   * }} param0
   */
  constructor({ dirname, basename = FILENAME } = {}) {
    this.dirname = dirname || process.cwd()
    this.basename = basename
    this.filename = path.resolve(this.dirname, basename)
    this.content = undefined
  }

  async _resolveFilename() {
    const parts = this.dirname.split(path.sep)
    let filename
    for (let maxDepth = 5; maxDepth > 0; maxDepth--) {
      filename = path.join(parts.join(path.sep), this.basename)
      const stats = await fsp.stat(filename).catch(() => null)
      if (stats?.isFile()) {
        break
      }
      parts.pop()
    }
    if (!filename) {
      throw new Error(`${this.basename} not found`)
    }
    this.filename = filename
  }

  /**
   * @private
   */
  _extract(_content) {
    const packages = {}
    // @ts-expect-error
    this.fields.forEach((dep) => {
      Object.entries(this.content[dep] || {}).forEach(([pckg, version]) => {
        packages[pckg] = version
      })
    })
    return packages
  }

  /**
   * @private
   */
  _merge(content, packages) {
    // @ts-expect-error
    this.fields.forEach((dep) => {
      Object.entries(this.content[dep] || {}).forEach(([pckg, _version]) => {
        const nextVersion = packages[pckg]
        if (nextVersion) {
          content[dep][pckg] = nextVersion
        }
      })
    })
    return content
  }

  /**
   * get all files under c4uIgnore and updateConfig.ignoreDependencies
   * Supported formats for updateConfig.ignoreDependencies:
   * - object: { "pkg": "^1.2.3" }
   * - array: [ "pkg@^1.2.3", "@scope/*@^2" , "pkg-without-range" ]
   * For array entries the optional range is parsed by splitting on the last `@`.
   * @returns {Record<string,string>|undefined}
   */
  getIgnored() {
    /** @type {Record<string,string>} */
    const result = {}

    const add = (sourceName, pckg, range, overwrite) => {
      if (!range || typeof range !== 'string') range = '*'
      const [cleanRange] = String(range).split(/\s*\/\/\s*/)
      if (semver.validRange(cleanRange)) {
        const trimmed = cleanRange.trim()
        if (overwrite) {
          result[pckg] = trimmed
        } else if (!Object.prototype.hasOwnProperty.call(result, pckg)) {
          result[pckg] = trimmed
        }
      } else {
        throw new Error(
          `${sourceName}: package "${pckg}" does not contain a valid range "${cleanRange}"`
        )
      }
    }

    const parseEntries = (sourceName, entries, overwrite = false) => {
      if (!entries) return
      if (Array.isArray(entries)) {
        entries.forEach((item) => {
          const [entryNoComment] = String(item).split(/\s*\/\/\s*/)
          const str = entryNoComment.trim()
          if (!str) return
          const idx = str.lastIndexOf('@')
          let name, range
          if (idx > 0) {
            name = str.slice(0, idx).trim()
            range = str.slice(idx + 1).trim()
          } else {
            name = str
            range = '*'
          }
          add(sourceName, name, range, overwrite)
        })
      } else if (typeof entries === 'object') {
        Object.entries(entries).forEach(([pckg, rangeComment]) => {
          const [range] = String(rangeComment).split(/\s*\/\/\s*/)
          add(sourceName, pckg, range, overwrite)
        })
      }
    }

    // Merge order: updateConfig.ignoreDependencies first (fallback), then c4uIgnore (overrides)
    parseEntries(
      'updateConfig.ignoreDependencies',
      this.content?.updateConfig?.ignoreDependencies,
      false
    )
    parseEntries('c4uIgnore', this.content?.c4uIgnore, true)

    return Object.keys(result).length ? result : undefined
  }

  /**
   * @returns {Promise<Packages>}
   */
  async read() {
    await this._resolveFilename()
    const str = await fsp.readFile(this.filename, 'utf-8')
    const content = yaml.load(str)
    this.fields = ['catalog']
    this.content = content
    return this._extract(content)
  }

  /**
   * @param {Record<string,string>} packages
   * @returns {Promise<void>}
   */
  write(packages = {}) {
    this.content = this._merge(this.content, packages)
    const str = yaml.dump(this.content)
    return fsp.writeFile(this.filename, str, 'utf8')
  }
}

export { PnpmWorkspaceYaml }
