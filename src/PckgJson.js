const fsp = require('fs/promises')
const { resolve } = require('path')
const semver = require('semver')

/**
 * @typedef {{}|Record<string,string>} Packages
 */

class PckgJson {
  /**
   * @param {{
   *  dirname?: string
   *  filename?: string
   * }} param0
   */
  constructor({ dirname, filename = 'package.json' } = {}) {
    this.dirname = dirname || process.cwd()
    this.filename = resolve(this.dirname, filename)
    this.content = undefined
  }

  /**
   * @private
   */
  _setFields(opts) {
    const fields = []
    if (opts.peer) fields.push('peerDependencies')
    if (opts.dev) fields.push('devDependencies')
    if (opts.prod) fields.push('dependencies')
    return fields
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
   * @param {{
   *  prod?: boolean
   *  dev?: boolean
   *  peer?: boolean
   * }} opts
   * @returns {Promise<Packages>}
   */
  read(opts = {}) {
    if (!opts.prod && !opts.dev && !opts.peer) {
      opts = { prod: true, dev: true, peer: true }
    }
    return fsp
      .readFile(this.filename, 'utf8')
      .then((str) => JSON.parse(str))
      .then((content) => {
        this.fields = this._setFields(opts)
        this.content = content
        return this._extract(content)
      })
  }

  /**
   * @param {Record<string,string>} packages
   * @returns {Promise<void>}
   */
  write(packages = {}) {
    this.content = this._merge(this.content, packages)
    const str = JSON.stringify(this.content, null, 2) + '\n'
    return fsp.writeFile(this.filename, str, 'utf8')
  }
}

module.exports = {
  PckgJson
}
