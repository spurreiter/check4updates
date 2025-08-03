export type FoundVersions = {
    /**
     * version range char `^`, '~'
     */
    wildcard: string;
    /**
     * max available version
     */
    max: string;
    /**
     * latest available version
     */
    latest?: string | undefined;
    /**
     * matching major version
     */
    major: string;
    /**
     * matching minor version
     */
    minor: string;
    /**
     * matching patch version
     */
    patch: string;
};
/**
 * @typedef {object} FoundVersions
 * @property {string} wildcard version range char `^`, '~'
 * @property {string} max max available version
 * @property {string} [latest] latest available version
 * @property {string} major matching major version
 * @property {string} minor matching minor version
 * @property {string} patch matching patch version
 */
/**
 * @param {string[]} versions - list of semver versions
 * @param {string} range - semver range
 * @param {string} [latest] - latest package version
 * @returns {FoundVersions|null}
 */
export function maxSatisfying(versions: string[] | undefined, range: string, latest?: string): FoundVersions | null;
