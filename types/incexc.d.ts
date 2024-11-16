export type Packages = import("./PckgJson").Packages;
/** @typedef {import('./PckgJson').Packages} Packages */
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
export function incexc({ packages, include, exclude, filter, filterInv }: {
    packages: Packages;
    include?: string[] | undefined;
    exclude?: string[] | undefined;
    filter?: RegExp | undefined;
    filterInv?: RegExp | undefined;
}): Packages;
