const fsp = require('fs/promises')
const path = require('path')
const semver = require('semver')
const yaml = require('js-yaml')

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
      console.log(filename)
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
   * get all files under c4uIgnore
   * @returns {Record<string,string>|undefined}
   */
  getIgnored() {
    const c4uIgnore = this.content?.c4uIgnore
    if (c4uIgnore && typeof c4uIgnore === 'object') {
      const rangesOnly = Object.entries(c4uIgnore).reduce(
        (curr, [pckg, rangeComment]) => {
          const [range] = String(rangeComment).split(/\s*\/\/\s*/)
          if (semver.validRange(range)) {
            curr[pckg] = range.trim()
          } else {
            throw new Error(
              `c4uIgnore: package "${pckg}" does not contain a valid range "${range}"`
            )
          }
          return curr
        },
        {}
      )
      return rangesOnly
    }
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

module.exports = {
  PnpmWorkspaceYaml
}
