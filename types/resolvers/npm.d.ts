export type Result = import("../types.js").Result;
export function prepare(spawnOpts: any): Promise<{
    strictSSL: boolean;
}>;
/**
 * @param {string} pckg - package name
 * @param {string} range - semver range
 * @param {object} opts - options
 * @returns {Promise<Result>}
 */
export function versions(pckg: string, range: string, opts: object): Promise<Result>;
/**
 * selected range
 * @param {object} versionO
 * @returns {string}
 */
export function range(versionO: object, type: any): string;
