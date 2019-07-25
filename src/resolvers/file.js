const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const log = require('debug')('check4updates:resolvers:file')

const mode = 'file'

const RE_VERSION = /([0-9]+\.[0-9]+\.[0-9]+(?:-.*|))/
const RE_EXT = /(\.tgz)$/
// file:../../../check4updates-1.0.0-0.tgz
const RE_FILE = new RegExp(/^(file:)(.*-)/.source + RE_VERSION.source + RE_EXT.source)

const toFile = pckg => pckg.replace(/[^0-9a-zA-Z]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '')

/**
 * test for file resolver
 * @param {string} range
 */
const test = range => RE_FILE.test(range)

/**
 * get versions from path obtained by dirname and range
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `file: ... .tgz`
 * @param {object} param2
 * @param {object} param2.dirname - actual dirname of package.json
 * @returns {Promise<Versions>}
 */
const versions = (pckg, range, { dirname }) => {
  const _range = range

  if (!test(range)) return Promise.reject(new Error(`${pckg}: no file provided `))
  range = '^' + _range.replace(RE_FILE, '$3')

  const filename = path.resolve(dirname, _range.replace(RE_FILE, '$2$3$4'))
  const _dirname = path.dirname(filename)

  return promisify(fs.readdir)(_dirname)
    .then(files => {
      log('files', files)
      const reFile = new RegExp(`^${toFile(pckg)}-` + RE_VERSION.source + RE_EXT.source)
      const versions = files.filter(f => reFile.test(f)).map(f => {
        const a = reFile.exec(f)
        return a[1]
      })
      log('%j', { pckg, versions })
      return {
        mode,
        package: pckg,
        _range,
        range,
        versions
      }
    })
    .catch(error => ({
      mode,
      package: pckg,
      _range,
      range,
      error
    }))
}

/**
 * return selected range
 * @param {object} versionO
 * @returns {string}
 */
const range = (versionO, type) => {
  const v = versionO[type]
  return v
    ? versionO._range.replace(RE_FILE, `$1$2${v}$4`)
    : versionO._range
}

module.exports = {
  test,
  versions,
  range
}
