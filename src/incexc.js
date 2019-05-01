/**
 * filter include and excludes
 * @param {object} param1
 * @param {object} param1.packages - `{ package: range }`
 * @param {string[]} param1.include - array of packages to include
 * @param {string[]} param1.exclude - array of packages to exclude
 */
const incexc = ({ packages, include = [], exclude = [] }) => {
  return Object.keys(packages)
    .filter(p => include.length ? include.includes(p) : true)
    .filter(p => exclude.length ? !exclude.includes(p) : true)
    .reduce((o, curr) => {
      if (packages[curr] !== undefined) o[curr] = packages[curr]
      return o
    }, {})
}

module.exports = {
  incexc
}
