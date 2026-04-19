/** @typedef {import('./PckgJson.js').Packages} Packages */

/**
 * filter include and excludes
 * @param {object} param1
 * @param {Packages} param1.packages - `{ package: range }`
 * @param {string[]} [param1.include] - array of packages to include
 * @param {string[]} [param1.exclude] - array of packages to exclude
 * @param {RegExp} [param1.filter] - regular expression to filter for package names
 * @param {RegExp} [param1.filterInv] - inverse regular expression to filter for package names
 * @returns {Packages}
 */
const incexc = ({
  packages,
  include = [],
  exclude = [],
  filter,
  filterInv
}) => {
  return Object.keys(packages)
    .filter((p) => (filter ? filter.test(p) : true))
    .filter((p) => (filterInv ? !filterInv.test(p) : true))
    .filter((p) => (include.length ? include.includes(p) : true))
    .filter((p) => (exclude.length ? !exclude.includes(p) : true))
    .reduce((o, curr) => {
      if (packages[curr] !== undefined) o[curr] = packages[curr]
      return o
    }, {})
}

export { incexc }
