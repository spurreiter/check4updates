const { promisify } = require('util')
const fs = require('fs')
const { resolve } = require('path')

const fsReadFile = promisify(fs.readFile)
const fsWriteFile = promisify(fs.writeFile)

class PckgJson {
  constructor ({ dirname, filename = 'package.json' } = {}) {
    this.dirname = dirname || process.cwd()
    this.filename = resolve(dirname, filename)
  }

  /**
   * @private
   */
  _setFields (opts) {
    const fields = []
    if (opts.peer) fields.push('peerDependencies')
    if (opts.dev) fields.push('devDependencies')
    if (opts.prod) fields.push('dependencies')
    return fields
  }

  /**
   * @private
   */
  _extract (content) {
    const packages = {}
    this.fields.forEach(dep => {
      Object.entries(this.content[dep] || {}).forEach(([pckg, version]) => {
        packages[pckg] = version
      })
    })
    return packages
  }

  /**
   * @private
   */
  _merge (content, packages) {
    this.fields.forEach(dep => {
      Object.entries(this.content[dep] || {}).forEach(([pckg, version]) => {
        const nextVersion = packages[pckg]
        if (nextVersion) {
          content[dep][pckg] = nextVersion
        }
      })
    })
    return content
  }

  read (opts = {}) {
    if (!opts.prod && !opts.dev && !opts.peer) {
      opts = { prod: true, dev: true, peer: true }
    }
    return fsReadFile(this.filename, 'utf8')
      .then(str => JSON.parse(str))
      .then(content => {
        this.fields = this._setFields(opts)
        this.content = content
        return this._extract(content)
      })
  }

  write (packages = {}) {
    this.content = this._merge(this.content, packages)
    const str = JSON.stringify(this.content, null, 2) + '\n'
    return fsWriteFile(this.filename, str, 'utf8')
  }
}

module.exports = {
  PckgJson
}
